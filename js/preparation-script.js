const main = document.querySelector("main");
const heading = document.querySelector("#heading");
const prereqList = document.querySelector("#prereq-list");

const mediaTitle = new URL(window.location.href).searchParams.get("title");

let mediaData, prereqData;

async function fetchData() {
    let response = await fetch("./data.xml");
    if(!response.ok) throw new Error("Failed to connect to the server!");
    let responseXML = await response.text();
    let data = new DOMParser().parseFromString(responseXML, "text/xml");
    mediaData = data.querySelector("mediaData").children;
    prereqData = data.querySelector("prereqData").children;
}

async function findPrereqs(title) {    
    let prereqMedia = [];
    for(let media of mediaData) {
        if(media.querySelector("title").textContent == title) {
            let majorPrereqs = media.querySelector("majorPrereqs").children;
            let minorPrereqs = media.querySelector("minorPrereqs").children;
            for(let prereqTitle of [...majorPrereqs, ...minorPrereqs]) {
                if(prereqTitle.nodeName == "media") {
                    let prereqMediaTitle = prereqTitle.textContent;
                    let morePrereqMedia = await findPrereqs(prereqMediaTitle);
                    for(let newPrereq of morePrereqMedia) {
                        if(!prereqMedia.includes(newPrereq) && !localStorage.getItem(newPrereq)) {
                            prereqMedia.push(newPrereq);
                        }
                    }
                    if(!prereqMedia.includes(prereqMediaTitle)) prereqMedia.push(prereqMediaTitle);
                }
                else for(let prereq of prereqData) {
                    if(prereq.querySelector("title").textContent == prereqTitle.textContent) {
                        prereqSatisfied = false;
                        for(let appearance of prereq.querySelector("appearances").children) {
                            if(prereqMedia.includes(appearance.textContent) || localStorage.getItem(appearance.textContent)) {
                                prereqSatisfied = true;
                                break;
                            }
                        }
                        if(!prereqSatisfied) {
                            let prereqMediaTitle = prereq.querySelector("appearances").children[0].textContent;
                            let morePrereqMedia = await findPrereqs(prereqMediaTitle);
                            for(let newPrereq of morePrereqMedia) {
                                if(!prereqMedia.includes(newPrereq) && !localStorage.getItem(newPrereq)) {
                                    prereqMedia.push(newPrereq);
                                }
                            }
                            if(!prereqMedia.includes(prereqMediaTitle)) prereqMedia.push(prereqMediaTitle);
                        }
                    }
                }
            }
            return prereqMedia;
        }
    }
}

async function displayPrereqs() {
    try {
        if(localStorage.getItem(mediaTitle)) heading.textContent = "You have already watched " + mediaTitle + ".";
        else {
            await fetchData();
            if(mediaData && mediaData.length > 0) {
                prereqMedia = await findPrereqs(mediaTitle);
                if(prereqMedia.length > 0) {
                    heading.textContent = "Before you watch " + mediaTitle + ", you should watch these:"
                    for(let media of mediaData) {
                        if(prereqMedia.includes(media.querySelector("title").textContent)) {
                            let prereqMediaElement = document.createElement("li");
                            prereqMediaElement.textContent = media.querySelector("title").textContent;
                            prereqMediaElement.classList.add("info");
                            prereqList.appendChild(prereqMediaElement);
                        }
                    }
                }
                else heading.textContent = "You are ready to watch " + mediaTitle + "!";
            }
            else throw new Error("We could not access the media list.");
        }
    }
    catch(error) {
        console.error(error);
        alert(error);
    }
}

displayPrereqs();