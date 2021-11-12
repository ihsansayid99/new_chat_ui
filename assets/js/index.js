$(function() {
    console.log( "ready!" );
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: 5,
        pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
        },
        navigation: {
            nextEl: ".swiper-button-next",
        },
        breakpoints: {
            1024: {
                slidesPerView: 5,
                spaceBetween: 1
            },
            768: {
                slidesPerView: 5,
                spaceBetween: 1
            },
            640: {
                slidesPerView: 5,
                spaceBetween: 20
            },
            320: {
                slidesPerView: 5,
                spaceBetween: 1
            }
        }
    });

    let arrayUsers = [
        {
            id: 1,
            nama: "Ihsan Sayid",
            avatar: "./assets/img/avatar-2.png",
            email: "admin1@gmail.com",
            noHp: "628117405275",
            notif: 5,
            online: false
        },
        {
            id: 2,
            nama: "Lasida",
            avatar: "./assets/img/avatar-3.png",
            email: "admin6@gmail.com",
            noHp: "628561655028",
            notif: 10,
            online: true
        },
        {
            id: 3,
            nama: "Andra Adi",
            avatar: "./assets/img/avatar-4.png",
            email: "admin5@gmail.com",
            noHp: "6283812980380",
            notif: null,
            online: true
        },
        {
            id: 4,
            nama: "Gantira",
            avatar: "./assets/img/avatar-5.png",
            email: "admin4@gmail.com",
            noHp: "089644213248",
            notif: null,
            online: true
        },
        {
            id: 5,
            nama: "Reza Pahlawan",
            avatar: "./assets/img/avatar-6.png",
            email: "admin3@gmail.com",
            noHp: "089644213249",
            notif: 5,
            online: false
        },
        {
            id: 6,
            nama: "Raina Khansa",
            avatar: "./assets/img/avatar-7.png",
            email: "admin2@gmail.com",
            noHp: "089644213240",
            notif: 2,
            online: false
        }
    ]
    let chatMessage2 = []

    // var messagesRef = db.ref('chat').limitToLast(10);
    // messagesRef.on('value', (snapshot) => {
    //     const data = snapshot.val();
    //     console.log(data)
    // });
    
    // Chat JSON to Element
    function populateChatUser(arrayChat){
        arrayChat.map((item) => {
            return arrayUsers.find((itemA) => {
                if(item.from == itemA.noHp){
                    item.from = itemA
                }
                if(item.to == itemA.noHp){
                    item.to = itemA
                }
            })
        })
    }

    async function getChatById(id){
        $('#main-chat-wrapper').children().remove()
        var chatFilter = await chatMessage2.filter(function(chat){
            return chat.to.id === id
        })
        load(chatFilter)
    }
    
    function filteringDataChat(chatFilter){
        const days = groupByDate(chatFilter)
        const sortedDays = Object.keys(days).sort(
            (x, y) => moment(y, 'YYYY-MM-DD').unix() - moment(x, 'YYYY-MM-DD').unix()
        );
        const items = sortedDays.reduce((acc, date) => {
            const sortedMessages = days[date].sort(
                (x, y) => {
                    new Date(y.created_at) - new Date(x.created_at)
                }
            );
            var dateChats = moment(date); // fixed just for testing, use moment();
            var today = moment();
            var yesterday = moment().subtract(1, 'days').startOf('day');
            var aWeek = moment().subtract(7, 'days').startOf('day');
            
            let dateString = ""
            if(dateChats.isSame(today, 'd'))
                dateString = "TODAY"
            else if(dateChats.isSame(yesterday, 'd'))
                dateString = "YESTERDAY"
            else if(dateChats.isAfter(aWeek, 'd'))
                dateString = "A WEEK AGO"
            else 
                dateString = date
            return acc.concat([{ type: 'day', date: dateString, id: date, data: [...sortedMessages] }]);
        }, []);
        return items
    }

    function groupByDate(messages){
        return messages.reduce((acc, el, i) => {
            const messageDay = moment(el.created_at).format('YYYY-MM-DD');
            if (acc[messageDay]) {
                return { ...acc, [messageDay]: acc[messageDay].concat([el]) };
            }
            return { ...acc, [messageDay]: [el] };
        }, {});
    }

    function dateTime(time){
        var newTime = time.split(" ")
        newTime = newTime[1].split(":")
        newTime = newTime[0] + ":" + newTime[1]
        return newTime
    }

    arrayUsers.forEach((item, index) => {
        swiper.appendSlide(`
            <div class="swiper-slide">
                <div class="c-avatar">
                    <img src="${item.avatar}" alt="" class="avatar" id="${item.id}">
                    
                    ${item.notif === null ? `` : `<div class="avatar-notif">${item.notif}</div>`}
                </div>
            </div>
        `)
    })


    //Sidebar slide
    $('.header-utils button').click(function(){
        $('#sideNav').toggleClass('active-sidebar')
    })

    //Clickable user list
    let numClicks = 0;
    $("#swiperChatUsers div img").click(function(){
        numClicks++;
        if (numClicks === 1) {
            singleClickTimer = setTimeout(() => {
                numClicks = 0;
                $(this).closest('.swiper-slide').addClass('active-user').siblings().removeClass('active-user')
                var id = $(this).attr("id")
                id = parseInt(id)
                arrayUsers.find(item => {
                    if(item.id === id){
                        $('.header-content_name').text(item.nama)
                        $('.header-content_info .header-content_info_email').text(item.email)
                        $('.header-content_info .header-content_info_phone').text(item.noHp)
                        return true
                    }
                    return false
                })
                getChatById(id)
            }, 200);
        } else if (numClicks === 2) {
            clearTimeout(singleClickTimer);
            numClicks = 0;
            $(this).addClass('avatar-close')
            $(this).closest('.c-avatar').append(`<div class="avatar-user-list"><img src="./assets/img/close-ic.svg" /></div>`)

            $(this).siblings('.avatar-user-list').children('img').click(function(){
                const indexOfSwiper = swiper.clickedIndex
                swiper.removeSlide(indexOfSwiper)
            })
            
            var aaa = $(this)
            setTimeout(function(){
                $(aaa).removeClass('avatar-close')
                $(aaa).siblings('.avatar-user-list').remove()
            }, 4000)
        }
    })

    function defaultActiveUser(){
        var userActiveDefault = $('.swiper-slide').eq(0).addClass('active-user')
        var idActiveDefault = userActiveDefault.find('img.avatar').attr("id")
        idActiveDefault = parseInt(idActiveDefault)
        arrayUsers.find(item => {
            if(item.id === idActiveDefault){
                $('.header-content_name').text(item.nama)
                $('.header-content_info .header-content_info_email').text(item.email)
                $('.header-content_info .header-content_info_phone').text(item.noHp)
                return true
            }
            return false
        })
        getChatById(idActiveDefault)
    }


    // Click active toolbar chat 
    let delayChat = $('.delay-chat').hide()
    let emojiChat = $('.text-emoji').hide()
    let templateChat = $('.template-chat').hide()
    let imageUploadChat = $('.image-upload-chat').hide()
    let textChat = $('.text-chat').show()
    $('#text-chat').parent().addClass('active-toolbar-chat') //Active default
    $('#user-swiper-toggle').parent().addClass('active-toolbar-chat-parent') //Active default
    //Without user toggle swiper
    $('.toolbar-chat-utils .toolbar_cub_left button .cub_img').click(function(){
        $(this).parent().addClass('active-toolbar-chat').siblings().removeClass('active-toolbar-chat')
        var id = $(this).attr("id");
        $(`.${id}`).show().siblings('.wrapper-toolbar').hide()
    })
    //with user toggle swiper
    $('.toolbar-chat-utils .toolbar_cub_left button .cub_img_user_toggle').click(function(){
        $(this).parent().toggleClass('active-toolbar-chat-parent')
        $('.toolbar-users').toggleClass('active-toolbar-chat-swiper')
        $('.toolbar-chat-utils-details').toggleClass('active-toolbar-chat-swiper-parent')
        heightUploadWrapper()
    })

    // Bolder, Underline, italic tools text chat
    // Bold
    $('#textBolder').click(function(){
        document.execCommand('bold');
    })
    // Italic
    $('#textItalic').click(function(){
        document.execCommand('italic');
    })
    // Underline
    $('#textUnderline').click(function(){
        document.execCommand('underline');
    })
    // Strike
    $('#textStrike').click(function(){
        document.execCommand('strikeThrough');
    })
    // TEXT DETECT URL
    function urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        })
    }
    
    function loadArrayObject(arrayChat){
        var divParent = $('#main-chat-wrapper')
        for (let i = arrayChat.length - 1; i >= 0; i--) {
            const element = arrayChat[i];
            var html = '<div class="chat-bubble-wrapper">'
            html += `
            <div class="chat-date">
                 <p>${arrayChat[i].date}</p>
             </div>
            <div id="chat-messanger">
            `
            for (let x = 0; x < arrayChat[i].data.length; x++) {
                const elementx = arrayChat[i].data[x];
                html += `
                    <div class="chat-msg ${elementx.from_me === true ? "right-msg" : "left-msg"}">
                        <div class="chat-msg-img">
                            <div class="c-avatar">
                                <img src="${elementx.from.avatar}" class="avatar" alt="${elementx.from.nama}">
                                ${elementx.from.online === true ? '<div class="avatar-online"></div>' : ''}
                            </div>
                        </div>
                        <div class="chat-msg-bubble">
                            <div class="msg-info-user">
                                <div><p>Ihsan Sayid</p></div>
                                <div>
                                    <span class="badge ${elementx.from_me === true ? "badge-danger" : "badge-success"}">${elementx.from_me === true ? "Moderator" : "Customer"}</span>
                                </div>
                            </div>
                            <div class="msg-text">
                                ${elementx.media_url === null ? urlify(elementx.message) : elementx.media_url} 
                            </div>
                            <div class="chat-msg-info">
                                <div class="msg-info-right">
                                    <span class="${elementx.status === 'DELIVERED' ? 'unread-msg' : ''}">${dateTime(elementx.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="chat-msg-utils" id="chat-utils-${elementx.id}">
                            <div class="chat-msg-utils_item">
                                <div class="chat-msg-utils_item-info">
                                    <img src="./assets/img/reply-ic.svg" />
                                    <span>Reply</span>
                                </div>
                                <div class="chat-msg-utils_item-info">
                                    <img src="./assets/img/trash-ic.svg" />
                                    <span>Delete</span>
                                </div>
                            </div>
                            <div class="chat-msg-utils_button">
                                <button class="btn btn-clear">
                                    <img src="./assets/img/chat-util-ic.svg"/>
                                </button>
                            </div>
                        </div>
                    </div>
                `
            }
            html += "</div>"
            html += "</div>"
            divParent.append(html)
        }
    }

    
    function load(arrayChat){
        populateChatUser(arrayChat)
        let chatfilter = filteringDataChat(arrayChat)
        loadArrayObject(chatfilter)
        var chatDiv = document.getElementById("chats");
        chatDiv.scrollTop =  chatDiv.scrollHeight - 100;

        //Click Chat Utils Message Rply / Delete
        $('.chat-msg-utils_button button').click(function(){
            $(this).closest('.chat-msg-utils_button').parent().children('.chat-msg-utils_item').toggleClass('active-chat-utils')
        })
    }
    

    function clearTextInput(){
        $('.text-chat-toolbar').text("")
    }

    // FUnction generate Bytes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getDataImage(data){
        console.log(data)
        return data
    }

    //Send Message to chat
    $('#btn-send-msg').click(function(){
        let msg = $('.text-chat-toolbar').html()
        let sectionUpload = $('.section-upload-img')
        var idActive = $('.swiper-slide.swiper-slide-active.active-user').find('img').attr("id")
        if(msg.length > 0){
            newChat(msg, null, idActive)
        }
        if(sectionUpload.length > 0){
            sectionUpload.each(function(){
                var $this = $(this)
                var msgImg = $this.find('.file-upload-info input').val()
                var imgToChat = `<img src="${msgImg}" style="max-width: 200px;">`
                newChat(null, imgToChat, idActive)
                $this.remove()
            })
        }
    })

    // Upload IMG
    $('#fileUpload').on('change', function(e){
        var count=1;
        var files = e.currentTarget.files;
        uploadData(files)
    })

    // preventing page from redirecting
    $("html").on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#pasteImage').text('Drag Disini...')
    });

    $("html").on("drop", function(e) { e.preventDefault(); e.stopPropagation(); });

    // Drag enter
    $('.pasteImageWrapper').on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#pasteImage').text('DROP')
    });

    // Drag over
    $('.pasteImageWrapper').on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#pasteImage').text('DROP')
    });

    // Drop
    $('.pasteImageWrapper').on('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();

        $('#pasteImage').text('Upload')

        var file = e.originalEvent.dataTransfer.files;

        uploadData(file);
    });

    $("#pasteImage").click(function(){
        $("#fileUpload").click();
        $('#pasteImage').text('Upload gambar atau paste disini')
    });

    document.onpaste = async (e) => {
        var items = (e.clipboardData || e.originalEvent.clipboardData);
        var files = items.files
        if(files.length > 0){
            uploadData(files)
            return true
        }else{
            return false
        }
    }

    function newChat(data, media, id){
        var date = new Date();
        var dateString =
            date.getUTCFullYear() + "-" +
            ("0" + (date.getUTCMonth()+1)).slice(-2) + "-" +
            ("0" + date.getUTCDate()).slice(-2) + " " +
            ("0" + date.getHours()).slice(-2) + ":" +
            ("0" + date.getMinutes()).slice(-2) + ":" +
            ("0" + date.getSeconds()).slice(-2);
        chatMessage2.push({
            "to": "628117405275",
            "from":"628117405275",
            "from_group":false,
            "from_me":true,
            "message": data,
            "media_url": media === null ? null : media,
            "type":"text",
            "status":"DELIVERED",
            "created_at": dateString,
            "updated_at": dateString,
            "reply_for":0,
            "failed_reason":null,
            "timestamp":1620185543
        }) 
        // firebase.database().ref("messages").push().set({
        //     "to": "628117405275",
        //     "from": "628117405275",
        //     "from_group":false,
        //     "from_me": true,
        //     "message": data,
        //     "media_url": media === null ? null : media,
        //     "type":"text",
        //     "status":"DELIVERED",
        //     "created_at": dateString,
        //     "updated_at": dateString,
        //     "reply_for":0,
        //     "failed_reason":null,
        //     "timestamp":1620185543
        // });
        clearTextInput()
        load(chatMessage2)
        var chatFilter2 = chatMessage2.filter(function(chat){
            return chat.to.id === 1
        })
        $('#main-chat-wrapper').children().remove()
        load(chatFilter2)
        $('.chat-msg-bubble:last').addClass('new-message-bubble')
    }

    // String limit
    function stringLimit(text){
        var count = 40;
        return text.slice(0, count) + (text.length > count ? "..." : "");
    }
    
    function uploadData(data){
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            $('#section-upload-wrapper').append(`
                <div class="section-upload-img">
                    <div class="file-upload-preview file-upload-successs">
                        <div class="file-upload-info">
                            <input type="hidden">
                            <p class="text-upload-info d-none">${element.name}</p>
                            <p>${stringLimit(element.name)}</p>
                            <span>${formatBytes(element.size)}</span>
                        </div>
                        <div class="file-upload-close-btn">
                            <button class="btn btn-clear">
                                <img src="./assets/img/upload-close-ic.svg" alt="">
                            </button>
                        </div>
                    </div>
                </div>
            `)
        }
        $('.section-upload-img .file-upload-preview .file-upload-close-btn button').click(function(){
            $(this).closest('.section-upload-img').remove()
            var nameFile = $(this).parent().siblings('.file-upload-info').children('.text-upload-info').text();
            var storage = firebase.storage().ref().child(nameFile)
            storage.delete().then(function(){
                console.log('berhasil dihapus')
            }).catch(function(err){
                console.log('error hapus')
            })
        })
        sendToFirebaseStorage(data)
    }

    function sendToFirebaseStorage(data){
        for (let i = 0; i < data.length; i++) {
            const ref = firebase.storage().ref();
            const element = data[i];
            const name = (+new Date()) + '-' + element.name;
            const metadata = {
                contentType: element.type
            };
            const upload = ref.child(name).put(element, element)
            let uploadInputVal = $('.section-upload-img').eq(i).find('.file-upload-info input')
            let uploadText = $('.section-upload-img').eq(i).find('.file-upload-info p')
            let uploadTextHidden = $('.section-upload-img').eq(i).find('.file-upload-info .text-upload-info')
            let uploadSuccess = $('.section-upload-img').eq(i).find('.file-upload-preview')
            uploadText.text(stringLimit(name))
            uploadTextHidden.text(name)
            upload.on(
                "state_changed",
                function progress(snapshot){
                    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    $('#pasteImage').text(`loading ${percentage}%`)
                },
                function error(){
                    console.log('error upload')
                },
                function complete(){
                    uploadSuccess.addClass('file-upload-success')
                    $('#pasteImage').text('Uploaded!')
                    upload.snapshot.ref.getDownloadURL().then(url => {
                        uploadInputVal.val(url)
                    })
                }
            )
        }
    }

    function emojiLoad(){
        // EMOJI 
        var emojis_raws = JSON.parse(JSON.stringify(emojis_raw));
        var emojis = {}
        // Create categories
        for (let emoji of emojis_raws) {
            if (emojis[emoji.category] === undefined) {
                emojis[emoji.category] = [];
            }
            emojis[emoji.category].push(emoji);
        }

            //Wrapper Emoji Box
        let emojisUl = document.createElement('ul');
        emojisUl.setAttribute('id', 'emojis');

            //Categories (li)
        for (let key in emojis) {
            let category = emojis[key];
            let categoryLi = document.createElement('li');
            let categoryH2 = document.createElement('h2');
            let categoryUl = document.createElement('ul');
            

            categoryUl.classList.add('list');
            categoryLi.classList.add('category', 'category-' + key.toLowerCase());
            categoryH2.classList.add('title');
            categoryH2.textContent = key;
            categoryLi.appendChild(categoryH2);
            
            for (let emojiPos in category) {
                let emojiLi = document.createElement('li'),
                    emojiA = document.createElement('a');
                
                emojiA.textContent = category[emojiPos].emoji;
                emojiA.setAttribute('href', '#');
                emojiA.addEventListener('click', function(e) {
                    $('.text-chat-toolbar').append(e.target.textContent)
                    // $('.text-emoji').hide();
                    // $('.text-chat').show();
                });
                
                emojiLi.classList.add('item');
                emojiLi.appendChild(emojiA);
                categoryUl.appendChild(emojiLi);
            }
            
            categoryLi.appendChild(categoryUl);
            emojisUl.appendChild(categoryLi);
        }

        $('.text-emoji').append(emojisUl)
    }

    function heightUploadWrapper(){
        var heightUploadWrapper = $('.toolbar-chat-utils-details').height()
        $('.pasteImageWrapper').css({
            'line-height': heightUploadWrapper  + 'px'
        })
    }
    window.onload = function(){
        $.getJSON( "./chat.json", function( data ) {
            var limit = 4
            let chatMessage
            chatMessage = data.data
            var data = chatMessage.slice(0, limit)
            $.each(chatMessage, function(key, val){
                chatMessage2.push(val)
            })
            populateChatUser(chatMessage)
            defaultActiveUser()
        });

        $.ajax({
            type: "GET",
            url: "http://139.180.184.25:3333/messages",
            headers: {
                "device-key": "0443d4c3-95fd-461c-bb0b-8b8f9b492122"
            },
            success: function (data) {
                console.log(data)
            }
        })

        emojiLoad()
    }
    heightUploadWrapper()
});
