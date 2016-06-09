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

            var $row = $('<div class="component">');
            var $header = $('<header>');
            $header.append($('<span class="label">').text(component.label));
            $header.append($('<span class="status" style="background-color: ' + colorForHealth(component.health, 0.5, 0.8) + '; color: ' + colorForHealth(component.health, 0.3, 0.4) + '">').text(component.status));
            $row.append($header);
            if (component.status_description) {
                $row.append($('<div class="description">').text(component.status_description));
            }

            $group.find('.components').append($row);
        });
    });
});
