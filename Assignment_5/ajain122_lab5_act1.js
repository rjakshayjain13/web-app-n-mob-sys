function start() {
    requestData("London", addRow(1));
    requestData("Phoenix", addRow(2));
}

function addRow(n) {
    var table = document.getElementById("table");
    var row = table.insertRow(n);
    return row;
}

function requestData(city, row) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=f9cd3610e9144f965638b5be216a0b1d', false);
    //xhr.open('GET', 'http://localhost:8081?cityName=' +city);
    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4) {

            if (xhr.status >= 200 && xhr.status < 300) {

                //document.getElementById("jaanu").innerHTML = xhr.statusText;
                var data = JSON.parse(xhr.responseText);
                var c0 = row.insertCell(0);
                var c1 = row.insertCell(1);
                var c2 = row.insertCell(2);
                var c3 = row.insertCell(3);
                var c4 = row.insertCell(4);
                var c5 = row.insertCell(5);

                c0.innerHTML = data.name + ", " + data.sys.country;
                c1.innerHTML = timestamp(data.dt);
                c2.innerHTML = tempInCelsius(data.main.temp);
                c3.innerHTML = data.main.humidity;
                c4.innerHTML = speedInMPH(data.wind.speed);
                c5.innerHTML = data.clouds.all;

                fourlines();
            }
            if (xhr.status > 300) {
                switch (xhr.status) {
                    case 301:
                        document.getElementById("jaanu").innerHTML = "301 - Moved Permanently: The requested page has moved to a new URL";
                        break;
                    case 302:
                        document.getElementById("jaanu").innerHTML = "302 - Found: The requested page has moved temporarily to a new URL";
                        break;
                    case 304:
                        document.getElementById("jaanu").innerHTML = "304 - Not Modified: The requested page has not been modified since last requested";
                        break;
                    case 400:
                        document.getElementById("jaanu").innerHTML = "400 - Bad Request: The request cannot be fulfilled due to bad syntax";
                        break;
                    case 401:
                        document.getElementById("jaanu").innerHTML = "401 - Unauthorized: Missing or incorrect authentication credentials";
                        break;
                    case 403:
                        document.getElementById("jaanu").innerHTML = "403 - Forbidden: The request is understood, but it has been refused or access is not allowed";
                        break;
                    case 404:
                        document.getElementById("jaanu").innerHTML = "404 - Not Found: The requested page could not be found but may be available again in the future";
                        break;
                    case 405:
                        document.getElementById("jaanu").innerHTML = "405 - Method Not Allowed: A request was made of a page using a request method not supported by that page";
                        break;
                    case 406:
                        document.getElementById("jaanu").innerHTML = "406 - Not Acceptable: Invalid Format Specified";
                        break;
                    case 500:
                        document.getElementById("jaanu").innerHTML = "500 - Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request";
                        break;
                    case 501:
                        document.getElementById("jaanu").innerHTML = "501 - Not Implemented: The server does not support the functionality required to fulfill the request";
                        break;
                    case 502:
                        document.getElementById("jaanu").innerHTML = "502 - Bad Gateway: The server was acting as a gateway or proxy and received an invalid response from the upstream server";
                        break;
                    case 503:
                        document.getElementById("jaanu").innerHTML = "503 - Service Unavailable: The server is currently unable to handle the request due to a temporary overload or scheduled maintenance. Try again later";
                        break;
                    case 504:
                        document.getElementById("jaanu").innerHTML = "504 - Gateway Timeout: The server was acting as a gateway or proxy and did not receive a timely response from the upstream server";
                        break;
                    case 505:
                        document.getElementById("jaanu").innerHTML = "505 - HTTP Version Not Supported: The HTTP version used in the request is not supported by the server";
                        break;
                    default:
                        document.getElementById("jaanu").innerHTML = "3XX/4XX/5XX Error Occured";
                }
            }
        }
    }
    xhr.send();
}


function tempInCelsius(k){
    k = parseFloat((k - 273.15).toFixed(2));
    return k;
}


function speedInMPH(s) {
    s = parseFloat((s * 2.237).toFixed(2));
    return s;
}

function timestamp(t) {
    var tt = new Date(t * 1000);
    var year = tt.getFullYear();
    var month = tt.getMonth() + 1;
    var date = tt.getDate();
    var hour = tt.getHours();
    var min = tt.getMinutes();
    var sec = tt.getSeconds();
    var time = year + ':' + month + ':' + date + ':' + hour + ':' + min + ':' + sec;
    return time;
}

var thirdcity;
function thirdCity() {
    var third = document.getElementById("third");
    thirdcity = third.options[third.selectedIndex].value;
    console.log(thirdcity);

    if (document.getElementById("table").rows.length == 3) {
        requestData(thirdcity, addRow(3));
    }
    else if (document.getElementById("table").rows.length == 4) {
        document.getElementById("table").deleteRow(3);
        requestData(thirdcity, addRow(3));
    }
    else if (document.getElementById("table").rows.length == 5) {
        requestData(thirdcity, addRow(5));
    }
    else if (document.getElementById("table").rows.length == 6) {
        document.getElementById("table").deleteRow(5);
        requestData(thirdcity, addRow(5));
    }
    else if (document.getElementById("table").rows.length == 7) {
        document.getElementById("table").deleteRow(6);
        document.getElementById("table").deleteRow(5);
        requestData(thirdcity, addRow(5));
    }
}


function refreshContent() {

    var rowcount = document.getElementById("table").rows.length;

    var cities = [];

    if(rowcount < 5)
    {
        for(var i=1; i<rowcount; i++){
            var c = document.getElementById("table").rows[i].cells[0].innerHTML;
            cc = c.split(",");
            cities.push(cc[0]);
        }

        for(var j=0; j< cities.length; j++){
            var veri = getData(cities[j]);
            var puri = document.getElementById("table").rows[2*j+1].cells[1].innerHTML;
            if(veri != puri){
                requestData(cities[j], addRow(2*j +1));
            }
            else{
                var row = addRow(2*j+2);
                var c0 = row.insertCell(0);
                var c1 = row.insertCell(1);
                var c2 = row.insertCell(2);
                var c3 = row.insertCell(3);
                var c4 = row.insertCell(4);
                var c5 = row.insertCell(5);

                c0.innerHTML = cities[j];
                c1.innerHTML = " ";
                c2.innerHTML = " ";
                c3.innerHTML = " ";
                c4.innerHTML = " ";
                c5.innerHTML = " ";
            }
        }
    }
    else if(rowcount >4)
    {
                                    if (rowcount == 5) {
                                        document.getElementById("table").deleteRow(4);
                                        document.getElementById("table").deleteRow(2);
                                        requestData("London", addRow(1));
                                        requestData("Phoenix", addRow(3));
                                    }
                                    else if (rowcount == 6) {
                                        document.getElementById("table").deleteRow(4);
                                        document.getElementById("table").deleteRow(2);
                                        requestData("London", addRow(1));
                                        requestData("Phoenix", addRow(3));
                                        requestData(thirdcity, addRow(5));
                                    }
                                    else if (rowcount == 7) {
                                        document.getElementById("table").deleteRow(6);
                                        document.getElementById("table").deleteRow(4);
                                        document.getElementById("table").deleteRow(2);
                                        requestData("London", addRow(1));
                                        requestData("Phoenix", addRow(3));
                                        requestData(thirdcity, addRow(5));
                                    }

                                    if(document.getElementById("table").rows[1].cells[1].innerHTML == document.getElementById("table").rows[2].cells[1].innerHTML){
                                        document.getElementById("table").rows[2].cells[1].innerHTML ="";
                                        document.getElementById("table").rows[2].cells[2].innerHTML ="";
                                        document.getElementById("table").rows[2].cells[3].innerHTML ="";
                                        document.getElementById("table").rows[2].cells[4].innerHTML ="";
                                        document.getElementById("table").rows[2].cells[5].innerHTML ="";
                                    }

                                    if(document.getElementById("table").rows[3].cells[1].innerHTML == document.getElementById("table").rows[4].cells[1].innerHTML){
                                        document.getElementById("table").rows[4].cells[1].innerHTML ="";
                                        document.getElementById("table").rows[4].cells[2].innerHTML ="";
                                        document.getElementById("table").rows[4].cells[3].innerHTML ="";
                                        document.getElementById("table").rows[4].cells[4].innerHTML ="";
                                        document.getElementById("table").rows[4].cells[5].innerHTML ="";
                                    }

                                    if(document.getElementById("table").rows[5].cells[1].innerHTML == document.getElementById("table").rows[6].cells[1].innerHTML){
                                        document.getElementById("table").rows[6].cells[1].innerHTML ="";
                                        document.getElementById("table").rows[6].cells[2].innerHTML ="";
                                        document.getElementById("table").rows[6].cells[3].innerHTML ="";
                                        document.getElementById("table").rows[6].cells[4].innerHTML ="";
                                        document.getElementById("table").rows[6].cells[5].innerHTML ="";
                                    }
    }
}

function getData(city) {

    var ts;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=f9cd3610e9144f965638b5be216a0b1d', false);
    //xhr.open('GET', 'http://localhost:8081?cityName=' +city);
    xhr.onreadystatechange = function () {

        if (xhr.readyState === XMLHttpRequest.DONE) {

            var data = JSON.parse(xhr.responseText);
            ts = timestamp(data.dt);
        }
    }
    xhr.send();
    return ts;
}

function fourlines() {

    var rowscount = document.getElementById("table").rows.length;

    var temperature = [];
    var humidity = [];
    var windSpeed = [];
    var cloudiness = [];

    var totaltemp = 0;
    var totalhumi = 0;

    if(rowscount < 5)
    {
        for(var i=1; i<rowscount; i++)
        {
            temperature.push(parseFloat(document.getElementById("table").rows[i].cells[2].innerHTML));
            humidity.push(parseFloat(document.getElementById("table").rows[i].cells[3].innerHTML));
            windSpeed.push(parseFloat(document.getElementById("table").rows[i].cells[4].innerHTML));
            cloudiness.push(parseFloat(document.getElementById("table").rows[i].cells[5].innerHTML));
            totaltemp += temperature[i-1];
            totalhumi +=humidity[i-1];
        }
    }
    else if(rowscount >4)
    {
        var j=0;
        for(var i=1; i<rowscount; i=i+2)
        {
            temperature.push(parseFloat(document.getElementById("table").rows[i].cells[2].innerHTML));
            humidity.push(parseFloat(document.getElementById("table").rows[i].cells[3].innerHTML));
            windSpeed.push(parseFloat(document.getElementById("table").rows[i].cells[4].innerHTML));
            cloudiness.push(parseFloat(document.getElementById("table").rows[i].cells[5].innerHTML));
            totaltemp += temperature[j];
            totalhumi +=humidity[j];
            j++;
        }
    }
    
    var avgtemp = totaltemp/temperature.length;
    var avghumi = totalhumi/humidity.length;

    var maxtemp = Math.max.apply(null, temperature);
    var mt = temperature.indexOf(maxtemp);

    var maxhumi = Math.max.apply(null, humidity);
    var mh = humidity.indexOf(maxhumi);

    var hottestCity = "", humidCity = "", nicest = "", worst = "";

    weather = [];
    for(var i=0; i<temperature.length; i++){
        weather.push((temperature[i]/2) + ((humidity[i]/10 + windSpeed[i]+ cloudiness[i])/10));
    }

    var minw = Math.min.apply(null, weather);
    var ww = weather.indexOf(minw);

    var weather2 = weather.slice(0);
    weather2.splice(ww, 1);

    var nicew = Math.min.apply(null, weather2);
    var nw = weather.indexOf(nicew);

    if(rowscount < 5){
        hottestCity = document.getElementById("table").rows[mt+1].cells[0].innerHTML;
        humidCity = document.getElementById("table").rows[mh+1].cells[0].innerHTML;
        nicest = document.getElementById("table").rows[nw+1].cells[0].innerHTML;
        worst = document.getElementById("table").rows[ww+1].cells[0].innerHTML;

    }else{
        hottestCity = document.getElementById("table").rows[(mt*2)+1].cells[0].innerHTML;
        humidCity = document.getElementById("table").rows[(mh*2)+1].cells[0].innerHTML;
        nicest = document.getElementById("table").rows[(nw*2)+1].cells[0].innerHTML;
        worst = document.getElementById("table").rows[(ww*2)+1].cells[0].innerHTML;
    }

    var line1 = "<br>The average temperature is <b>" + avgtemp.toFixed(2) + "</b> and the hottest city is <b>"+hottestCity+"</b><br>";
    var line2 = "The average humidity is <b>" + avghumi.toFixed(2) + "</b> and the most humid city is <b>"+humidCity+"</b><br>";
    var line3 = "The city with the nicest weather is <b>"+nicest+"</b><br>";
    var line4 = "The city with the worst weather is <b>"+worst+"</b><br>";

    document.getElementById("niche").innerHTML = line1+line2+line3+line4;
}