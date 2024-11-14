const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReplay: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/nevada-ft-cozi-zuehlsdorff.mp3',
            image: './assets/img/nevada.jpg'
        },
        {
            name: 'Summer Time',
            singer: 'K-391',
            path: './assets/music/summerTime.mp3',
            image: './assets/img/summerTime.jpg'
        },
        {
            name: 'Monody',
            singer: 'TheFatRat',
            path: './assets/music/monody-feat-laura-brehm.mp3',
            image: './assets/img/monody.jpg'
        },
        {
            name: 'Geometry',
            singer: 'Tobu & Diviners',
            path: './assets/music/geometry--house--ncs---copyright-free-music.mp3',
            image: './assets/img/geometry.jpg'
        },
        {
            name: 'NCS - Copyright Free Music',
            singer: 'Mortals x Royalty Mashup',
            path: './assets/music/ncs---copyright-free-music.mp3',
            image: './assets/img/ncs.jpg'
        },
        {
            name: 'Obsession',
            singer: 'More Plastic',
            path: './assets/music/obsession--dnb--ncs---copyright-free-music.mp3',
            image: './assets/img/obsession.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isReplay = this.config.isReplay;
    
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <li class="song_item ${index == this.currentIndex ? 'song_item--active' : ''}">
                    <img src="${song.image}" alt="" class="song_item--image">
                    <div class="song_item--description">
                        <p class="song_item--title">${song.name}</p>
                        <p class="song_item--artist">${song.singer}</p>
                    </div>
                    <button class="song_item--actions">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                </li>
            `
        })

        
        const playList = $('.song_list')
        playList.innerHTML = htmls.join('')
        

    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this 

        const songs = $('.songs');
        const song_img = $('.song_image ')
        const song_audio = $('.song_audio')
        const progressBar = $('.song_progressBar')
        const nextButton = $('.song_button--next')
        const prevButton = $('.song_button--prev')
        const randomButton = $('.song_button--random')
        const replayButton = $('.song_button--replay')
        const playList = $('.song_list')
        const volumeBar = $('.song_volumeBar')

        const size = song_img.offsetWidth 
        songs.onscroll = () => {
            const newSize = size - songs.scrollTop.toFixed(0)

            song_img.style.width = newSize > 0 ? newSize + 'px' : 0
            song_img.style.height = newSize > 0 ? newSize + 'px' : 0
            song_img.style.opacity = newSize / size
        }

        // ! Animate song img
        const song_img_animate = song_img.animate([
            {transform: 'rotate(360deg)'},
        ], {
            duration: 10000,
            iterations: Infinity
        })

        song_img_animate.pause()

        // ! Play and pause 
        const button = $('.song_button--play_pause')
        button.onclick = e => {
            if(_this.isPlaying)
                song_audio.pause()
            else 
                song_audio.play()

            song_audio.onplay = function() {
                // song_img.style.animation = 'rotate360 10s linear infinite'
                song_img_animate.play()
                _this.isPlaying = true
                button.classList.add('play')
            }
            
            song_audio.onpause = function() {
                // song_img.style.animation = ''
                song_img_animate.pause()
                _this.isPlaying = false
                button.classList.remove('play')
            }
            
        }
        
        // ! Update progress
        song_audio.ontimeupdate = function() {
            if(song_audio.duration) {
                const progressPercent = (song_audio.currentTime / song_audio.duration * 100)
                progressBar.value = progressPercent
                
                progressBar.style.setProperty('--progressBarWidth', '5px')
            }
        }

        // ! Progress bar change
        progressBar.onchange = function() {
            song_audio.pause()

            if(progressBar.value == 0) {
                progressBar.style.setProperty('--progressBarWidth', '0')
            }
            else {
                progressBar.style.setProperty('--progressBarWidth', '5px')
            }

            const seekTime = progressBar.value / 100 * song_audio.duration

            song_audio.currentTime = seekTime

            if(!_this.isPlaying) {
                button.classList.remove('play')
                _this.isPlaying = false
            }
        }

        // ! Next song
        nextButton.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            }
            else {
                _this.nextSong()
            }
            song_audio.play()
            button.classList.add('play')
            _this.isPlaying = true

            _this.render()
            song_img_animate.play()
            _this.scrollToActive()
        }

        // ! Prev song
        prevButton.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            }
            else {
                _this.prevSong()
            }
            song_audio.play()
            button.classList.add('play')
            _this.isPlaying = true

            _this.render()
            song_img_animate.play()
            _this.scrollToActive()
        }

        //  ! Random song
        randomButton.onclick = function() {    
            _this.isRandom = !_this.isRandom   
            _this.setConfig('isRandom', _this.isRandom)
            randomButton.classList.toggle('song_button--active', _this.isRandom)
        }

        // ! Audio ended
        song_audio.onended = function() {
            if(_this.isReplay) {
                song_audio.play()
            }
            else {
                nextButton.click()
            }
        }

        // ! Replay song
        replayButton.onclick = function() {
            _this.isReplay = !_this.isReplay
            _this.setConfig('isReplay', _this.isReplay)
            replayButton.classList.toggle('song_button--active', _this.isReplay)
        }

        // ! Click song
        playList.onclick = function(e) {
            if(
                e.target.closest('.song_item:not(.song_item--active)') &&
                !e.target.closest('.song_item--actions')
                
            ) {
                // console.log(e.target.closest('.song_item'))
                // console.log(playList.children)
                _this.currentIndex = Array.from(playList.children).indexOf(e.target.closest('.song_item'))
                _this.loadCurrentSong()

                song_audio.play()
                button.classList.add('play')
                _this.isPlaying = true
                _this.render()
                song_img_animate.play()

                // _this.scrollToActive()                                                                                                       
            }
            else if(e.target.closest('.song_item--actions')){
                alert('You click on actions')
            }
            else if(e.target.closest('.song_item--active')) {
                alert('You click on a active song')
            }
        }

        // ! Song volume
        console.log(song_audio.volume)
        // volumeBar.style.setProperty('--volumeBarWidth', song_audio.volume*100 + '%')

        volumeBar.onchange = function() {
            song_audio.volume = volumeBar.value / 100
        }
        
    },
    scrollToActive: function() {
        setTimeout(() => {
            $('.song_item--active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    loadCurrentSong: function() {
        const song_title = $('.song_title')
        const song_image = $('.song_image')
        const song_audio = $('.song_audio')

        song_title.textContent = this.currentSong.name 
        song_image.src = this.currentSong.image
        song_audio.src = this.currentSong.path
    },
    nextSong: function() {
        this.currentIndex++;

        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--;

        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        this.loadConfig()

        this.defineProperties()
        
        this.handleEvents();

        this.loadCurrentSong()

        this.render();  

        if(this.isRandom) {
            $('.song_button--random').classList.toggle('song_button--active', this.isRandom)
        }
        if(this.isReplay) {
            $('.song_button--replay').classList.toggle('song_button--active', this.isReplay)
        }

        $('.song_volumeBar').value = $('.song_audio').volume * 100
    }                               
}

app.start()
