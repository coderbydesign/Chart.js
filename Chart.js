$(document).ready(function(){
  if($("#index-charts-container").length > 0) {
    if (showCharts()) {
      $("#hide-charts").show();
      populateIndexCharts();
    } else {
      $("#show-charts").show();
    }
  }

  $("#hide-charts").on("click", function(){
    var reportId = $("#report-id").val();
    var hide = localStorage["hideCharts"];
    if (hide) {
      var existingPrefs = JSON.parse(hide);
      existingPrefs.reportsToHide.push(reportId);
      localStorage["hideCharts"] = JSON.stringify(existingPrefs);
    } else {
      var newPrefs = {hide:true,reportsToHide:[reportId]}
      localStorage["hideCharts"] = JSON.stringify(newPrefs);
    }
  });

  $("#show-charts").on("click", function(){
    var reportId = $("#report-id").val();
    var hide = localStorage["hideCharts"];
    if (hide) {
      var existingPrefs = JSON.parse(hide);
      existingPrefs.reportsToHide.pop(reportId);
      localStorage["hideCharts"] = JSON.stringify(existingPrefs);
      // refresh page
    } else {
      var newPrefs = {hide:true,reportsToHide:[]}
      localStorage["hideCharts"] = JSON.stringify(newPrefs);
    }
  });
});

function showCharts(reportId) {
  if (supportsHtml5Storage()) {
    var hide = localStorage["hideCharts"];
    if (JSON.parse(hide).hide !== true) {
      return shouldShow(reportId);
    } else {
      $("#chart-container").hide();
    }
  }
}

function shouldShow(reportId) {
  if (reportId) {
    //check report id in array and return true if not found
  }
}

function supportsHtml5Storage() {
  return 'localStorage' in window && window['localStorage'] !== null;
}

function populateReportCharts(data) {
  populateAllCharts(data);
}

function populateIndexCharts() {
  var jsonData = getIndexData();
  populateAllCharts(jsonData);
}

function populateAllCharts(data) {
  var dates = collectDates(data);
  populateChart("impressions",data.imps,dates);
  populateChart("cost",data.spend,dates);
  populateChart("clicks",data.clicks,dates);
  populateChart("conversions",data.conversions,dates);
}

function getIndexData() {
  var jsonData = [];
  $.ajax({
    url: 'client_reports/index_charts.json',
    async: false,
    dataType: 'json',
    success: function(json) {
      jsonData = json;
    }
  });
  return jsonData;
}

function populateChart(type,jsonData,dates) {
  var ctx = $("#" + type + "-chart").get(0).getContext("2d");
  var chart = new Chart(ctx);
  var data = {
    labels : dates,
    datasets : [
      datasetsFor(type,jsonData)
    ]
  }
  var options = chartDefaults(type);
  options = plotWhenDataIsEqual(options,data.datasets);
  new Chart(ctx).Line(data,options);
}

function plotWhenDataIsEqual(options,data) {
  var min = Math.min.apply(Math,data[0].data)
  var max = Math.max.apply(Math,data[0].data)
  if (min == max) {
    options.scaleOverride = true;
    options.scaleSteps = 10;
    options.scaleStepWidth = 1;
  }
  return options;
}

function collectDates(data) {
  var rawDates = Object.keys(data[Object.keys(data)[1]]);
  var formattedDates = formatRawDates(rawDates);
  return formattedDates;
}

function formatRawDates(dates) {
  formattedDates = Array();
  for(var i = 0; i < dates.length; i++) {
    var dataDate = dates[i].split("-");
    var d = new Date(dataDate[0],(parseInt(dataDate[1])-1).toString(),dataDate[2]);
    var day = d.getDate();
    var month = d.getMonth();
    month ++; // months are zero index
    var year = d.getFullYear();
    var formattedDate = month + "/" + day + "/" + year;
    formattedDates.push(formattedDate);
  };
  return formattedDates;
}

function chartDefaults(type) {
  var defaultOptions = {
    bezierCurve:false,
    pointDotRadius:5
  }
  if(type == "cost") {
    defaultOptions.labelType = "currency";
  };
  return defaultOptions;
}

function datasetsFor(type,jsonData) {
  var values = Array();

  for(day in jsonData) {
    values.push(jsonData[day]);
  }

  var dataset = {}
  if(type == "impressions") {
    dataset = {
      fillColor : "rgba(207,236,244,1)",
      strokeColor : "rgba(132,205,225,1)",
      pointColor : "rgba(95,192,218,1)",
      pointStrokeColor : "rgba(95,192,218,1)"
    }
  } else if(type == "cost") {
    dataset = {
      fillColor : "rgba(211,226,209,1)",
      strokeColor : "rgba(83,194,119,1)",
      pointColor : "rgba(40,120,66,1)",
      pointStrokeColor : "rgba(40,120,66,1)"
    }
  } else if(type == "clicks") {
    dataset = {
      fillColor : "rgba(236,202,174,1)",
      strokeColor : "rgba(233,165,77,1)",
      pointColor : "rgba(221,140,36,1)",
      pointStrokeColor : "rgba(221,140,36,1)"
    }
  } else if(type == "conversions") {
    dataset = {
      fillColor : "rgba(233,175,229,1)",
      strokeColor : "rgba(201,115,220,1)",
      pointColor : "rgba(138,22,163,1)",
      pointStrokeColor : "rgba(138,22,163,1)"
    }
  }

  dataset.data = values;
  return dataset;
}