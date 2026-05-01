const inputWatchedForm = document.querySelector("#input-watched-form");

let data, mediaData;

async function fetchData() {
    try {
        let response = await fetch("../data.xml");
        if(!response.ok) throw new Error("Failed to connect to the server!");
        let responseXML = await response.text();
        data = new DOMParser().parseFromString(responseXML, "text/xml");
        mediaData = data.querySelector("mediaData").children;
    }
    catch(error) {
        console.error(error);
        alert(error);
    }
}

async function createForm() {
    await fetchData();
    if(mediaData.length > 0) {
        for(media of mediaData) {
            let mediaTitle = media.querySelector("title").textContent;
            let mediaType = media.querySelector("type").textContent;

            let checkboxDiv = document.createElement("div");
            inputWatchedForm.appendChild(checkboxDiv);
            
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.setAttribute("id", mediaTitle);
            checkbox.checked = (localStorage.getItem(checkbox.getAttribute("id")) == "true");
            checkboxDiv.appendChild(checkbox);

            let checkboxLabel = document.createElement("label");
            checkboxLabel.setAttribute("for", mediaTitle);
            checkboxLabel.textContent = mediaTitle + " (" + mediaType + ")";
            checkboxDiv.appendChild(checkboxLabel);
            
            checkbox.addEventListener("click", function() {
                for(let currentChild of inputWatchedForm.children) {
                    currentCheckbox = currentChild.children[0];
                    localStorage.setItem(currentCheckbox.getAttribute("id"), currentCheckbox.checked);
                }
            });
        }
    }
    else {
        let errorMessage = document.createElement("b");
        errorMessage.textContent = "Error: we could not access the media list."
        inputWatchedForm.appendChild(errorMessage);
    }
}

createForm();