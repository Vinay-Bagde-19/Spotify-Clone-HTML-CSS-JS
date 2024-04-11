console.log("Let's write javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show the list of all the songs
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34px" src="music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Vinay</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="play.svg" alt="">
                        </div> </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    // Clear existing content in cardContainer
    cardContainer.innerHTML = "";

    array.forEach(async e => {
        // Check if the anchor points to a folder inside /songs
        if (e.href.includes("/songs/") && e.href !== "/songs/") {
            let folderName = e.href.split("/").pop(); // Get the folder name

            // Fetch the info.json for the folder
            let infoResponse = await fetch(`/songs/${folderName}/info.json`);
            let infoData = await infoResponse.json();

            // Create a card element for each folder
            let folderCard = document.createElement("div");
            folderCard.classList.add("card");
            folderCard.dataset.folder = folderName;
            folderCard.innerHTML = `
                <div class="play">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #1fdf64; display: flex; justify-content: center; align-items: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="fill: black; stroke: black; stroke-width: 2; stroke-linecap: round; stroke-linejoin: miter;">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"/>
                        </svg>
                    </div>
                </div>
                <img src="/songs/${folderName}/cover.jpg" alt="">
                <h2>${infoData.title || folderName}</h2>
                <p>${infoData.description || ''}</p>
            `;
            cardContainer.appendChild(folderCard);

            // Attach event listener to dynamic cards
            folderCard.addEventListener("click", async () => {
                console.log("Fetching Songs");
                let songs = await getSongs(`songs/${folderName}`);
                playMusic(songs[0], true);
            });
        }
    });
}




async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs")            // albums
    playMusic(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()

    // Attach event listener to play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // Listen for time updates
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event liistener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        // console.log("open")
        document.querySelector(".left").style.left = 0;
    })

    // Add an event liistener for close
    document.querySelector(".close").addEventListener("click", () => {
        // console.log("close");
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an event listener for previous and next
    previous.addEventListener("click", () => {
        currentSong.pause()
        // console.log("previous")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log("next")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listener for volume
    const volumeValueElement = document.querySelector(".volumeValue");

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        const volumeValue = parseInt(e.target.value);
        currentSong.volume = volumeValue / 100;
        volumeValueElement.textContent = `${volumeValue}%`;
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.muted = true;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            currentSong.muted = false;
        }
    })

}

main()