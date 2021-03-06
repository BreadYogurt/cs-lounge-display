const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
// const orgs = ["uiccs"];
const orgs = ["acm", "lug", "wics", "uiccs"];
const orgData = [];
orgData["acm"] = {
	name: "Association for Computing Machinery",
	logo: "images/acmLogo.png",
	acronym: "ACM",
	motd: "files/acm.motd",
	highlights: "files/acm.highlights",
	calendar: "https://calendar.google.com/calendar/ical/jj8ni13uoqol5v189ijah3eo9k%40group.calendar.google.com/private-f14d1576610252307d75f7eec8e26d8a/basic.ics"
};
orgData["lug"] = {
	name: "Linux Users Group",
	logo: "images/lugLogo.png",
	acronym: "LUG",
	motd: "files/lug.motd",
	highlights: "files/lug.highlights",
	calendar: "https://calendar.google.com/calendar/ical/jj8ni13uoqol5v189ijah3eo9k%40group.calendar.google.com/private-f14d1576610252307d75f7eec8e26d8a/basic.ics"
};
orgData["wics"] = {
	name: "Women in Computer Science",
	logo: "images/wicsLogo.png",
	acronym: "WiCS",
	motd: "files/wics.motd",
	highlights: "files/wics.highlights",
	calendar: "https://calendar.google.com/calendar/ical/jj8ni13uoqol5v189ijah3eo9k%40group.calendar.google.com/private-f14d1576610252307d75f7eec8e26d8a/basic.ics"
};
orgData["uiccs"] = {
	name: "UIC Computer Science",
	logo: "images/uicCsLogo.png",
	acronym: "CS",
	motd: "files/uicCs.motd",
	highlights: "files/uicCs.highlights",
	calendar: "https://calendar.google.com/calendar/ical/jj8ni13uoqol5v189ijah3eo9k%40group.calendar.google.com/private-f14d1576610252307d75f7eec8e26d8a/basic.ics"
};

function getApiData(type, arg, value) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		let url = "http://localhost:8080/api/" + type + "/?" + arg + "=" + value;
		xhr.open("GET", url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200) {
				let data;
				if (xhr.responseText) {
					try {
						data = JSON.parse(xhr.responseText);
					} catch (e) {
						console.log(e);
					}
				}
				resolve(data);
			}
		};
	});
}

function addZero(i) {
	return (i < 10) ? ("0" + i) : i;
}

function ampm(i) {
	return (i > 12) ? "AM" : "PM";
}

function timeAndDate() {
	let today = new Date();
	let hour = today.getHours();
	let min = today.getMinutes();
	let date = today.getDate();
	let month = today.getMonth();
	let day = DAYS[today.getDay()];
	hour = (hour > 12) ? (hour - 12) : hour;
	min = addZero(min);
	hour = addZero(hour);
	document.querySelector("#time>p").innerHTML = hour + ":" + min + " " + day + ", " + MONTHS[month] + " " + date;
	setTimeout(timeAndDate, 2000);
}

function getEvents(cal) {
	getApiData("calendar", "cal", cal).then((result) => {
		let k = 1;
		let content = "";
		let dtNow = new Date();
		let oldEvents = 0;
		while (k < result.length) {
			if (k > 4+oldEvents) break;
			let dtStart = new Date(result[k].timeStart);
			if (dtStart < dtNow) {
				oldEvents++;
				k++;
				continue;
			}
			let tmStartHour = dtStart.getHours();
			let tmStartAmPm = "AM";
			if (tmStartHour > 12) {
				tmStartHour -= 12;
				tmStartAmPm = "PM";
			}
			tmStartHour = addZero(tmStartHour);
			tmStart = DAYS[dtStart.getDay()] + ", " + MONTHS[dtStart.getMonth()] + " " + dtStart.getDate() + " " + tmStartHour + ":" + addZero(dtStart.getMinutes()) + tmStartAmPm;
			let dtEnd = new Date(result[k].timeEnd);
			let tmEndHour = dtEnd.getHours();
			let tmEndAmPm = "AM";
			if (tmEndHour > 12) {
				tmEndHour -= 12;
				tmEndAmPm = "PM";
			}
			tmEndHour = addZero(tmEndHour);
			tmEnd = DAYS[dtEnd.getDay()] + ", " + MONTHS[dtEnd.getMonth()] + " " + dtEnd.getDate() + " " + tmEndHour + ":" + addZero(dtEnd.getMinutes()) + tmEndAmPm;
			content += "<li>";
			content += "<span class=summary>" + result[k].summary + "</span>"
			content += "<span class=location>" + result[k].location + "</span>"
			content += "<span class=timeStart>" + tmStart + "</span>"
			content += "<span class=timeEnd>" + tmEnd + "</span>"
			// content += "<span class=description>" + result[k].description + "</span>";
			content += "</li>";
			document.querySelector("#events>p").innerHTML = content;
			k++;
		}
	});
}

function getMotd(file) {
	getApiData("file", "file", file).then((result) => {
		document.querySelector("#motd>p").innerHTML = result.data;
	});
}

function getHighlights(file) {
	getApiData("file", "file", file).then((result) => {
		document.querySelector("#highlights>p").innerHTML = result.data;
	});
}

function getWeather(city) {
	getApiData("weather", "city", city).then((result) => {
		let temp = result.main.temp;
		let tempF = Math.round(result.main.temp * 9 / 5 - 459.67);
		let tempC = Math.round(result.main.temp - 273.15);
		document.querySelector("#weather>p").innerHTML = "<span>" + result.weather[0].main + "</span><span>" + tempF + "&#176;F | " + tempC + "&#176;C</span>";
	});
	setTimeout(getWeather,30000);
}

getWeather("chicago");
timeAndDate();

var activeOrg = 0;
var counter = 0;

function updateActiveOrg() {
	activeOrg = counter % orgs.length;
	counter++;
	getMotd(orgData[orgs[activeOrg]].motd);
	getHighlights(orgData[orgs[activeOrg]].highlights);
	getEvents(orgData[orgs[activeOrg]].calendar);
	document.querySelector("#org-name").innerHTML = orgData[orgs[activeOrg]].name;
	document.querySelector("#org-logo>img").src = orgData[orgs[activeOrg]].logo;
	divChild = activeOrg + 1;
	divPreviousChild = (divChild == 1) ? orgs.length : divChild - 1;
	document.querySelector("#org-list>span:nth-child(" + divPreviousChild + ")").classList.remove("active");
	document.querySelector("#org-list>span:nth-child(" + divChild + ")").classList.add("active");
	setTimeout(updateActiveOrg, 15000)
}

function footerImages() {
	document.querySelector("#org-list").innerHTML = "";
	for (let j = 0; j < orgs.length; j++)
		document.querySelector("#org-list").innerHTML += "<span><img src='" + orgData[orgs[j]].logo + "'alt='" + orgData[orgs[j]].name + "'></span>";
}

footerImages();
updateActiveOrg();