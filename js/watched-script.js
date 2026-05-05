const inputWatchedFilmsForm = document.querySelector("#input-watched-films-form");
const inputWatchedSeriesForm = document.querySelector("#input-watched-series-form");
const inputWatchedMultiversalsForm = document.querySelector("#input-watched-multiversals-form");

let mediaData;

async function fetchData() {
    let response = await fetch("./data.xml");
    if(!response.ok) throw new Error("Failed to connect to the server!");
    let responseXML = await response.text();
    let data = new DOMParser().parseFromString(responseXML, "text/xml");
    mediaData = data.querySelector("mediaData").children;
}

async function createForm() {
    try {
        await fetchData();
        if(mediaData && mediaData.length > 0) {
            for(media of mediaData) {
                let mediaTitle = media.querySelector("title").textContent;
                let mediaType = media.querySelector("type").textContent;
                let mediaDataAddress = media.querySelector("dataAddress").textContent;

                let checkboxDiv = document.createElement("div");
                let inputWatchedForm = (mediaType == "Film") ? inputWatchedFilmsForm :
                ((mediaType == "Series") ? inputWatchedSeriesForm : inputWatchedMultiversalsForm);
                inputWatchedForm.appendChild(checkboxDiv);
                
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = mediaTitle;
                checkbox.checked = (localStorage.getItem(checkbox.id) == "true");
                checkboxDiv.appendChild(checkbox);

                let checkboxTitle = document.createElement("a");
                checkboxTitle.classList.add("quiet-link");
                checkboxTitle.href = "./media-information.html?address=" + mediaDataAddress;
                checkboxTitle.textContent = mediaTitle;

                let checkboxLabel = document.createElement("label");
                checkboxLabel.for = mediaTitle;
                checkboxLabel.appendChild(checkboxTitle);
                checkboxDiv.appendChild(checkboxLabel);
                
                checkbox.addEventListener("click", function() {
                    for(let currentChild of inputWatchedForm.children) {
                        currentCheckbox = currentChild.children[0];
                        localStorage.setItem(currentCheckbox.id, currentCheckbox.checked);
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