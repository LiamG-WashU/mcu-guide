const inputWatchedFilmsForm = document.querySelector("#input-watched-films-form");
const inputWatchedSeriesForm = document.querySelector("#input-watched-series-form");

let data, mediaData;

async function fetchData() {
    let response = await fetch("../data.xml");
    if(!response.ok) throw new Error("Failed to connect to the server!");
    let responseXML = await response.text();
    data = new DOMParser().parseFromString(responseXML, "text/xml");
    mediaData = data.querySelector("mediaData").children;
}

async function createForm() {
    try {
        await fetchData();
        if(mediaData && mediaData.length > 0) {
            for(media of mediaData) {
                let mediaTitle = media.querySelector("title").textContent;
                let mediaType = media.querySelector("type").textContent;

                let checkboxDiv = document.createElement("div");
                let inputWatchedForm = (mediaType == "Film") ? inputWatchedFilmsForm : inputWatchedSeriesForm;
                inputWatchedForm.appendChild(checkboxDiv);
                
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.setAttribute("id", mediaTitle);
                checkbox.checked = (localStorage.getItem(checkbox.getAttribute("id")) == "true");
                checkboxDiv.appendChild(checkbox);

                let checkboxLabel = document.createElement("label");
                checkboxLabel.setAttribute("for", mediaTitle);
                checkboxLabel.textContent = mediaTitle;
                checkboxDiv.appendChild(checkboxLabel);
                
                checkbox.addEventListener("click", function() {
                    for(let currentChild of inputWatchedForm.children) {
                        currentCheckbox = currentChild.children[0];
                        localStorage.setItem(currentCheckbox.getAttribute("id"), currentCheckbox.checked);
                    }
                });
            }
        }
        else throw new Error("We could not access the media list.");
    }
    catch(error) {
        console.error(error);
        alert(error);
    }
}

createForm();