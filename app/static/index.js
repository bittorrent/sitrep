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
    var upTime = ((uptime / historyScale) * 100).toFixed(5);

    return {name: component.label, status: component.status, timelineData: timelineData, timelineColors: timelineColors, upTime: ((uptime / historyScale) * 100).toFixed(6) + '%'};
}

function populateComponent(data) {
    var $componentContainer = $($('#component-container-template').html()).appendTo('.components-container');
    var chart = new google.visualization.Timeline($componentContainer.find('.timeline').get(0));
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

    $componentContainer.find('.name').text(data.name);
    $componentContainer.find('.up-time').text(data.upTime);
    $componentContainer.find('.status').text(data.status).addClass(data.status == 'stream error' ? 'error' : '');

    $componentContainer.on('resized', function() {
        chart.draw(dataTable, options);
    });

    $componentContainer.trigger('resized');
}

$(function(){
    google.charts.load("current", {
        packages: ["timeline"]
    });
    google.charts.setOnLoadCallback(init);

    $(window).resize(function () {
        if($('.components-container').data('width') != $('.components-container').width() && !$('.components-container').data('resizing')) {
            $('.components-container').data('resizing', true);
            $('.components-container').data('width', $('.components-container').width());
            $('.components-container .component-container').trigger('resized');
            $('.components-container').data('resizing', false);
        }
    });
});
