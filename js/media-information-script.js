const main = document.querySelector("main");
const infobox = document.querySelector("#infobox");

const address = new URL(window.location.href).searchParams.get("address");

async function displayData() {
    try {
        let response = await fetch("https://api.themoviedb.org/3/" + address + "?api_key=b6e2a42cbe0cc177d08b60029e216c29");
        if(!response.ok) throw new Error("Failed to connect to the server!");
        let data = await response.json();

        let image = document.createElement("img");
        image.classList.add("media-image");
        image.src = "https://image.tmdb.org/t/p/w1280" + data.poster_path;
        infobox.appendChild(image);

        let title = document.createElement("p");
        title.classList.add("heading");
        if("original_title" in data) title.textContent = data.original_title;
        else title.textContent = data.name;
        infobox.appendChild(title);

        let releaseDate = document.createElement("p");
        if("release_date" in data) releaseDate.textContent = formatDate(data.release_date);
        else releaseDate.textContent = formatDate(data.first_air_date);
        infobox.appendChild(releaseDate);

        let overview = document.createElement("p");
        overview.textContent = data.overview;
        infobox.appendChild(overview);
    }
    catch(error) {
        console.error(error);
        alert(error);
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});
}

displayData();