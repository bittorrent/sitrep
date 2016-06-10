function colorForHealth(health, saturation, brightness) {
    return 'hsl(' + Math.round(health / 100 * 120) + ', ' + Math.round(saturation * 100) + '%, ' + Math.round(brightness * 100) + '%)';
}

$(function() {
    $.get('/api/v1/components', function(data) {
        $.each(data.components, function(id, component) {
            var $group = $('#other');
            if (component.tags.type == 'swarm-server') {
                $group = $('#swarm-servers');
            }
            $group.show();

            var now = Math.floor(Date.now() / 1000);

            var $row = $('<div class="component">');
            var $header = $('<header>');
            $header.append($('<span class="label">').text(component.label));
            $header.append($('<span class="status" style="background-color: ' + colorForHealth(component.health, 0.5, 0.8) + '; color: ' + colorForHealth(component.health, 0.3, 0.4) + '">').text(component.status));
            $row.append($header);

            if (component.status_description) {
                $row.append($('<div class="description">').text(component.status_description));
            }

            var $history = $('<div class="update-history">');
            var t = now;
            var historyScale = 24 * 60 * 60;
            var uptime = 0;
            $.each(component.update_history, function(i, update) {
                var time = new Date(update.time).getTime() / 1000;
                var start = Math.max(time, now - historyScale);
                var end = Math.min(t, time + update.lifetime);
                if (start >= end) {
                    return;
                }
                var width = 100 * (end - start) / historyScale;
                var $update = $('<span class="update">');

                if (update.status_description) {
                    $update.attr('data-tooltip', update.status_description);
                }

                $update.css('left', (start - now + historyScale) / historyScale * 100 + '%');
                $update.css('background-color', colorForHealth(update.health, 0.5, 0.8));
                $update.css('width', width + '%');
                $update.css('z-index', 100 - update.health);
                $history.append($update);

                uptime += update.health / 100 * (end - start);
                t = time;
            });
            $row.append($history);

            $header.append($('<span class="uptime">').text('24H: ' + (uptime / historyScale) * 100 + '%'));

            $group.find('.components').append($row);
        });
    });
});
