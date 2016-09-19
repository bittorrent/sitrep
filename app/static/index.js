function colorForHealth(health, saturation, brightness) {
    return 'rgb(' + HSLToRGB((health / 100) * (120 / 360), saturation, brightness).join(',') + ')';
}

function hueToRGB(p, q, t){
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
}

function HSLToRGB(h, s, l) {
    var r, g, b;

    if (s === 0){
        r = g = b = l;
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hueToRGB(p, q, h + 1/3);
        g = hueToRGB(p, q, h);
        b = hueToRGB(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function init() {
    $.get('/api/v1/components', function(data) {
        $.each(data.components, function(id, component) {
            componentData = getComponentData(component);
            populateComponent(componentData);
        });
    });
}

function getComponentData(component) {
    var updateHistory = component.update_history;
    var now = Math.floor(Date.now() / 1000);
    var t = now;
    var historyScale = 12 * 60 * 60;
    var timelineData = [];
    var timelineColors = [];
    var uptime = 0;

    for(var i = 0; i < updateHistory.length; i++) {
        var update = updateHistory[i];
        var time = new Date(update.time).getTime() / 1000;
        var start = Math.max(time, now - historyScale);
        var end = Math.min(t, time + update.lifetime);
        if (start >= end) {
            break;
        }

        var status = update.status_description ? update.status_description : (update.health == 100 ? 'Healthy.' : 'Unhealthy.');
        var data = [update.label, status, new Date(start * 1000), new Date(end * 1000)];

        timelineData.unshift(data);
        timelineColors.unshift(colorForHealth(update.health, 0.5, 0.8));
        uptime += update.health / 100 * (end - start);
        t = time;
    }

    return {
        name: component.label,
        status: component.status,
        timelineData: timelineData,
        timelineColors: timelineColors,
        uptime: ((uptime / historyScale) * 100).toFixed(6) + '%',
        tags: component.tags
    };
}

function populateComponent(data) {
    var $group = null;
    $('.component-group').each(function() {
        if (!$(this).data('tags')) { return; }
        var tags = $(this).data('tags');
        var match = true;
        for (var key in tags) {
            if (data.tags[key] != tags[key]) {
                match = false;
            }
        }
        if (match) {
            $group = $(this);
        }
    });
    if (!$group) {
        $group = $('#other-components');
    }
    var $container = $group.children('.component-container');
    $group.show();

    var $component = $($('#component-template').html()).appendTo($container);
    var chart = new google.visualization.Timeline($component.find('.timeline').get(0));
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({
        type: 'string',
        id: 'Role'
    });
    dataTable.addColumn({
        type: 'string',
        id: 'Name'
    });
    dataTable.addColumn({
        type: 'date',
        id: 'Start'
    });
    dataTable.addColumn({
        type: 'date',
        id: 'End'
    });
    dataTable.addRows(data.timelineData);

    var options = {
        timeline: {
            groupByRowLabel: true,
            showBarLabels: false,
            showRowLabels: false
        },
        avoidOverlappingGridLines: false,
        colors: data.timelineColors
    };

    $component.find('.name').text(data.name);
    $component.find('.up-time').text('12H: ' + data.uptime);
    $component.find('.status').text(data.status).addClass(data.status == 'stream error' ? 'error' : '');

    $component.on('resized', function() {
        chart.draw(dataTable, options);
    });

    $component.trigger('resized');
}

function checkHash() {
    if (window.location.hash == '#compact') {
        $('body').addClass('compact');
    } else {
        $('body').removeClass('compact');
    }
}

$(function() {
    checkHash();
    $(window).on('hashchange', function() {
        checkHash();
    });

    google.charts.load("current", {
        packages: ["timeline"]
    });
    google.charts.setOnLoadCallback(init);

    $(window).resize(function () {
        if($('.component-container').data('width') != $('.component-container').width() && !$('.component-container').data('resizing')) {
            $('.component-container').data('resizing', true);
            $('.component-container').data('width', $('.component-container').width());
            $('.component-container .component').trigger('resized');
            $('.component-container').data('resizing', false);
        }
    });
});
