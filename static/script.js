
function myFunc(vars) {
    return vars;
}

/**
 * Toggle visibility of a content tab
 * @param  {Object} element Selector for the element
 */
function switchTab(tab){
    if (tab.attr('class') == 'active-tab'){
        //pass
    }
    else{
        toggle(tab, 'active-tab');
        toggle(tab.siblings(), 'active-tab');
        tabs = {
            'login':'sign-in-form',
            'sign-up':'sign-up-form',
            'item-table':'info',
            'item-chart':'insights'
        }
        selectedTab = tabs[tab.attr('id')]
        console.log($(`#${selectedTab}`))
        hideElement($(`#${selectedTab}`).siblings());
        showElement($(`#${selectedTab}`));
    }
}

/**
 * Opens Modal for selected content
 * @param  {Object} element Selector for the element
 */
function openModal(element){
    hideElement($('.modal-box'))
    modals = {
            'item': 'item-modal',
            'shelf-item': 'item-modal',
            'sign-in-up': 'sign-in-up-modal',
            'my-collection-link': 'custom-modal',
            'append-permession-modal' : 'append-permession-modal'
        }
    showElement($(`#${modals[element.attr('id')]}`));
    showModalBg();
}

/**
 * Create rating for an item
 * @param  {Int} stars_no rating value in int
 */
function rating (stars_no) {
    let stars = $(`<div id='rating'></div>`);

    for (let star = 1; star <= 5; star++) {

        if (star <= stars_no){
            stars.append(`<span class="fa fa-star checked"></span>`);
        }
        else{
            stars.append(`<span class="fa fa-star"></span>`);
        }

    }

    return stars;
}

/**
 * Toggle visibility of a content tab
 * @param  {Object} selector Selector for the element
 * @param  {String}   toggle   The class to be toggled
 */
function toggle(element, className){
    element.toggleClass(className);
}

/**
 * show element
 * @param  {Object} selector Selector for the element to be shown
 */
function showElement(element){
    $(element).removeClass('hide-element')
}

/**
 * hide element
 * @param  {Object} selector Selector for the element to be hidden
 */
function hideElement(element){
    $(element).addClass('hide-element')
}

/**
 * SVG Animation
 */
function btnSvgAnim() {
    toggle($(".bi-chevron-double-down"), "arrw-up");
    if ($('.show-more-btn p').text().trim() == "Show more") {
        $('.show-more-btn p').text("Show less");
      } else {
        $('.show-more-btn p').text("Show more");
      }
}



/**
 * Toggle visibility of a content tab
 * @param  {Object} item item to be rated
 */
function rateItem(item){
    $('.ratings-count').text(`${('volumeInfo' in item ? item.volumeInfo.ratingsCount : 0)} Ratings`);
    if ('volumeInfo' in item ? item.volumeInfo.averageRating : item.rating){
        ratingCount = parseInt('volumeInfo' in item ? item.volumeInfo.averageRating : item.rating);
        stars = $('.fa-star');
        for (let star = 0; star < ratingCount; star++) {
            stars.eq(star).addClass('checked');
        }
    }
    else{
        //pass
    }
}

/**
 * adding Txt btn in describtion based on description length
 * @param  {String} textLength input txt length
 */
function adjustTxtBtn(textLength){
    $('#book-description').addClass('book-description')
    $(".bi-chevron-double-down").removeClass('arrw-up')
    $('.show-more-btn p').text("Show more");
    hideElement($(".show-more-btn"))

    if (textLength > 440) 
    {
        showElement($(".show-more-btn"));
        $(".show-more-btn").click(function(){
            $('#book-description').toggleClass('book-description')
            btnSvgAnim()
        });
        
    }
}


//reseting Modal data 
function resetItemModal(){
    $(".show-more-btn").unbind();
    //$(".book-shelf, #favourite, .show-more-btn").unbind();
    $('.fa-star').removeClass('checked');
    hideElement($('.buy-button'));
    $('.book-shelf').attr('data-label', 1)
    $('.book-shelf').data('label', 1)
    $('#favourite').data('favourite', 0);
    $('#favourite').attr('data-favourite', 0);
}

/**
 * Display all item info in modal
 * @param  {String} itemId ID for item to be displayed
 */
function display_info(itemId){
    //reseting Modal data
    resetItemModal();
    item = itemsObjects[itemId]
    // Adding new Item to DB if not exists
    viewItem(itemId)
    if('volumeInfo' in item){
        search = true;
    }
    else{
        search = false;
    }
    // adding data for new item
    $('#item-modal .item_img').attr('src', search ? item.volumeInfo.imageLinks.thumbnail : item.image_url);
    $('#item-modal .modal-title').text(search ? item.volumeInfo.title : item.title);
    $('#item-modal #book-description').text(search ? item.volumeInfo.description : item.description);
    $('#item-modal #author').text(search ? item.volumeInfo.authors : item.author);
    $('#item-modal #publisher').text(search ? item.volumeInfo.publisher : item.publisher);
    $('#item-modal #published-date').text(search ? item.volumeInfo.publishedDate : item.release_date);
    $('#item-modal #page-count').text(search ? item.volumeInfo.pageCount : item.page_count);
    $('#item-modal #print-type').text(search ? item.volumeInfo.printType : item.print_type);
    $('#item-modal #language').text(search ? item.volumeInfo.language : item.language);
    $('#item-modal #categories').text(search? item.volumeInfo.categories : item.category);
    $('#item-modal #maturity-rating').text(search ? item.volumeInfo.maturityRating : item.rating);
    $('#item-modal #favourite').data('item-id', itemId);
    $('#item-modal #favourite').attr('data-item-id', itemId);
    $('#item-modal #favourite').data('favourite', checkIfFav(itemId));
    $('#item-modal #favourite').attr('data-favourite', checkIfFav(itemId));
    $('#item-modal .book-shelf').attr('data-item-id', itemId);
    $('#item-modal .book-shelf').data('item-id', itemId);
    $('#item-modal .book-shelf').attr('data-check', get_shelf(itemId));
    $('#item-modal .book-shelf').data('check', get_shelf(itemId));
    rateItem(item);
    displayChart(itemId)

    //adjusting new items data
    adjustTxtBtn('volumeInfo' in item ? (item.volumeInfo.description.length ? item.volumeInfo.description.length : item.title.description.length) : item.description.length);

    setFavIcon();
    if(item.saleInfo ? item.saleInfo.buyLink : item.buy_url){
        showElement($('.buy-button'));
        $('.buy-button a').attr('href', item.saleInfo ? item.saleInfo.buyLink : item.buy_url)
    }

    if($('.book-shelf').data('check')== '0'){
        set_shelf($('.book-shelf').data('label'));
    }
    else{
        set_shelf($('.book-shelf').data('check'));
    }


}

/**
 * check if this item is favourite in users data
 * @param  {String} volume_id item to be checked
 */
function checkIfFav(volume_id){
    let favBool = "";
    $.ajax({
        url: '/check_if_fav',
        data:{'volume_id': volume_id},
        async: false,
        type: 'GET',
        success: function(response){

            favBool = response;

        },
        error: function(error){
                console.log('error');
                return '0'
        }
    });

    if (favBool == 0){
        return 0;
    }

    return favBool;
}

/**
 * update user favourites in DB
 * @param  {String} volume_id volume to be updated
 */
function update_favourits(volume_id){
    console.log(volume_id)
    $.ajax({
        url: '/update_favourits',
        data:{'volume_id': volume_id},
        type: 'GET',
        success: function(response){
            console.log(`favourites ${response}`)
            $('#favourite').data('favourite', response);
            $('#favourite').attr('data-favourite', response);
            checkIfFav(volume_id)
            setFavIcon(volume_id);
        },
        error: function(error){
            console.log('error');
        }
    });

}

// show dropdown menu
function usr_dropdwn(){
    if ($(".user-list").css("visibility") == 'visible'){    
        $(".user-list").css("visibility", "hidden");
    }
    else{
        $(".user-list").css("visibility", "visible");
    }
}

function selectionText(element){
    var selection = []
    element.each(function() {
        var $this = $(this);
        selection.push($(this).text());
    });

    return selection;
}

//generate filter query to be used in retrieving filtered data in user items
function generateQuery(){
    var filter_query = {
        keywords:$('#keywords').val(),
        category:selectionText($('#categories [data-select=1]')),
        language:selectionText($('#languages [data-select=1]')),
        release_date:{
            year_from:$('#year-from').val(),
            year_to:$('#year-to').val(),
        },
        page_count:$('#page-count-no').val()
    };

    return filter_query;

}

/**
 * create element for each image in List
 * @param  {Array} imgIdList create element for each image in List
 */
function createElementItem(imgIdList){
    itemIndex = 0
    var item = $('<div></div>').attr({
                    'id': 'item',
                    'data-item-id': `${imgIdList.id}`,   
    });
    item.addClass('list-item');
    item.bind('click', function() {
        openModal($(this))
        display_info($(this).data('item-id'));
    });
    var item_img = $('<img>').addClass('item-img').attr('src', `${imgIdList.image}`);
    item_img.attr("style", "width:9rem; height:13rem;")
    item.append(item_img);
    itemsElements.push(item);

}

itemsObjects = {}

/**
 * turn array of items to Object of items
 * @param  {Array} itemsAll turn array of items to Object of items
 */
function ObjectifyItems(itemsAll){

    if ($.isArray(itemsAll)){
        newObjects =  Object.assign({}, ...itemsAll.map((obj) => ({[obj.item_id ? obj.item_id : obj.id]: obj})));

        Object.assign(itemsObjects, newObjects);
    }
    else{
        Object.entries(itemsAll).forEach(([key, value]) => {
            ObjectifyItems(value)
            return;
        });
    }
    return itemsObjects;
}

/**
 * arrange items in shelf based on input attriputes
 * @param  {Node} element attribute selected to arrange by
 */
function arrangeItems(element){
    let listId = element.attr('id');
    let sortAttr = $('.sort-attr [data-select=1]', element).text().trim();
    let sortOrder = $('.sort-order', element).attr("data-select");
    let itemsToSort = items['shelves'] ? items['shelves'] : items;
    switch (sortAttr){
    case 'Name':

        if (sortOrder == 0){
            itemsToSort[listId]?.sort((a, b) => (a.title.toLowerCase().localeCompare(b.title.toLowerCase())));
        }
        else{
            itemsToSort[listId]?.sort((a, b) => (b.title.toLowerCase().localeCompare(a.title.toLowerCase())));
        }
        break;

    case 'Rating':

        if (sortOrder == 0){
            itemsToSort[listId]?.sort((a, b) => (a.rating > b.rating ? -1 : 1))
        }
        else{
            itemsToSort[listId]?.sort((a, b) => (b.rating > a.rating ? -1 : 1))
        }
        break;

    case 'Release date':

        if (sortOrder == 0){
            itemsToSort[listId]?.sort((a, b) =>  new Date(a.release_date) > new Date(b.release_date) ? -1 : 1);
        }
        else{
            itemsToSort[listId]?.sort((a, b) =>  new Date(b.release_date) > new Date(a.release_date) ? -1 : 1);
        }
        break;

    case 'Page count':

        if (sortOrder == 0){
            itemsToSort[listId]?.sort((a, b) => (b.page_count > a.page_count ? -1 : 1))
        }
        else{
            itemsToSort[listId]?.sort((a, b) => (a.page_count > b.page_count ? -1 : 1))
        }
        break;

    default:
        text = "Error";
    }

}

/**
 * inserting items frim DB in user collection shelves
 * @param  {Array} itemsToInsert Array of items to be inserted
 */
function insertItems(itemsToInsert){
    Object.entries(itemsToInsert).forEach(([key, value]) => {
        itemsElements = []
        arrangeItems($(`[id='${key}']`));
        shelfItems = itemsToInsert[key].map(obj => ({image: obj.image_url, id: obj.id})).forEach(createElementItem);
        $(`[id='${key}'] .list-content`).empty();
        $(`[id='${key}'] .list-content`).append(itemsElements);
        setSlider($(`[id='${key}'] .list-content`))
    })

}

 // filter user items based on input
function filterItems(){
    let query = generateQuery();
    $.ajax({
        url: `/get_user_items${JSON.stringify(query)}`,
        async: false,
        type: 'GET',
        success: function(response){
            items = response;
            insertItems(items)

        },
        error: function(error){
            console.log('error');
        }
    });

}

// reset filter in my books page
function resetFilter(){
    location.reload()
}

/**
 * turn sider to starting position before sorting again
 * @param  {Node}  element  The element that to be positioned
 */
function resetSlider(element){
    $('.list-content', element).css("transform", `translateX(0rem)`);
    adjustSliderBtns($('.slider-btn', element), 0, 140);
}

/**
 * update user books data
 * @param  {String} volume_id item to be updated
 */
function update_shelf(volume_id){

    let shelf_code = $('.book-shelf').data('label');
    console.log(`label ${shelf_code}`)
    console.log(`item ${volume_id}`)
    $('.book-shelf').attr('data-check', `${shelf_code}`);
    $('.book-shelf').data('check', `${shelf_code}`);
    console.log(`check ${$('.book-shelf').data('check')}`)

    $.ajax({
        url: "/update_shelf",
        data: {'volume_id': volume_id, 'shelf': $('.book-shelf').data('check')},
        type: 'GET',
        success: function(response){
            //set_shelf(shelf_code);
            console.log(`shelf ${response}`)
            if(response == 0){
                $('.book-shelf').data('check', '0');
                $('.book-shelf').attr('data-check', '0');
                set_shelf(shelf_code);
            }
            else{
                $('.book-shelf').data(`'check', '${shelf_code}'`);
                $('.book-shelf').attr(`'data-check', '${shelf_code}'`);
                set_shelf($('.book-shelf').data('check'));
            }


        },
        error: function(error){
            console.log('error');
        }

    });


}


/**
 * Setting new selected shelf for an item in DB and HTML
 * @param  {String} shelf_code shelf to which item is added
 */
function set_shelf(shelf_code){
    shelf_labels = {'1': 'To read', '2': 'Have read', '3': 'Reading'};
    let shelf_label = shelf_labels[String(shelf_code)];
    let current_shelf = $('.book-shelf').data('check');
    $(`.book-shelf svg`).removeClass('check');
    $('.modal-btns svg').removeClass('check')

    if(current_shelf == '0'){
        //pass
        
    }
    else if(current_shelf == String(shelf_code)){
        $(`.book-shelf svg`).addClass('check');
        $(`.shelf-menu li[data-label='${shelf_code}'] svg`).addClass('check');
    }
    $('.book-shelf').data('label', shelf_code);
    $('.book-shelf').attr('data-label', shelf_code);
    $('.book-shelf p').text(shelf_label);

    $(`ul *[data-check="${current_shelf}"] svg`).addClass('check');

    //$('.shelf-menu').css('display', 'none');
    hideElement($('.shelf-menu'))
}


/**
 * set Fav icon based on DB while displaying data
 */
function setFavIcon(){
    if ($('#favourite').data('favourite') == 1){
        $(".bi-heart-fill").css("fill", "black");
    }
    else{
        $(".bi-heart-fill").css("fill", "grey");
    }
}

/**
 * getting current shelf of an item from DB while displaying its info
 * @param  {String} volume_id item to be checked
 */
function get_shelf(volume_id){
    let shelf_code = "";
    $.ajax({
        url: '/get_shelf',
        data:{'volume_id': volume_id},
        async: false,
        type: 'GET',
        success: function(response){
            console.log(response)
            shelf_code = response;
        },
        error: function(error){
            shelf_code = '0'
        }
    });

    if (shelf_code == 'None'){
        return 0;
    }

    return shelf_code;

}

// getting total books count for user
function getMyBooksCount(){
    $.ajax({
        url: '/get_my_books_count',
        type: 'GET',
        success: function(response){
            setMyBooksCount(response)
        }
    })
}

/**
 * setting total books count in nav bar
 * @param  {String} count count to be displayed
 */
function setMyBooksCount(count){
    $('#usr_books_count').text(`Books (${count})`)
}


//getting user viewed books while browsing
function getBrowseHistory(index){
    $.ajax({
        url: '/browse_history',
        data:{'query_index': index},
        type: 'GET',
        success: function(response){
            itemsElements = []
            console.log(response)
            response['Browse history'].map(obj => ({image: obj.image_url, id: obj.item_id})).forEach(createElementItem);
            $('#recently-viewed .list-content').empty();
            $('#recently-viewed .list-content').append(itemsElements);
            setSlider($('#recently-viewed .list-content'))            
        },
        error: function(error){
            console.log('error');
        }
    });

}

/**
 * Closing opened modal
 * @param  {Node} element Modal to be colsed
 */
function closeModal(element) {
    hideElement($(".modal-box:not(.hide-element)"));
    hideElement($(".modal-layer"));
}

 // showing Bg effect while modal is open
function showModalBg() {
    showElement($(".modal-layer"));
}

/**
 * set Slidet based on items length
 * @param  {Array} shelfItems items to be added in a slider
 */
function setSlider(shelfItems){
    if (shelfItems.children().length == 0){
        showElement(shelfItems.siblings('h1'))
        hideElement(shelfItems)
    }
    else{
        hideElement(shelfItems.siblings('h1'))
        showElement(shelfItems)
    }
    if (shelfItems.children().length <= 5){
        hideElement(shelfItems.parents('.slider').children('.slider-btn'))
    }
    else{
        showElement(shelfItems.parents('.slider').children('.slider-btn'))
    }
    
    
}

//Show dropdown shelf menu
function dropdwn_shelf_menu() {
    if ($(".shelf-menu").css("display") == 'none'){    
        $(".shelf-menu").css("display", "block");

    }
    else{
        //$(".shelf-menu").css("display", "none");
        hideElement($('.shelf-menu'))
    }
}


// direting to My collection
async function directMyBooks(){
    $.ajax({
        url: '/my_books',
        type: 'GET',
        success: function(response){
            if (response == 'None'){
                openModal($('#my-collection-link'));
            }
            else{
                window.location.href = "/my_books";
                //pass
            }
        },
        error: function(error){
            console.log('error');
        }
    });
}


/**
 * Appending items saved in session to usr data in DB when he log in
 * @param  {String} order user order to append items y/n
 */function appendPermession(order){

    $.ajax({
        url: '/append_permession',
        data:{'order': order},
        type: 'GET',
        success: function(response){
            //pass
            console.log('success')
            closeModal($('#append-permession-modal'));
            location.reload();
        },
        error: function(error){
            console.log('error');
        }
    });
}


//Signin
function signIn() {
    $('#login-error').css('display', 'none');
    $.ajax({
        url: '/login',
        data: $('form').serialize(),
        type: 'POST',
        success: function(response){
            if (response == 'Both fields are required'){
                $('#login-error').text(`* ${response}`);
                $('#login-error').css('display', 'block');
                console.log(response);
            }
            else if(response == "Invalid Email or Password"){
                $('#login-error').text(`* ${response}`);
                $('#login-error').css('display', 'block');
            }
            else if(response == 'append_permession'){
                //location.reload();
                openModal($('#append-permession-modal'));
            }
            else{
                location.reload();
            }

            console.log(response)
        },
        error: function(error){
            console.log('error');
        }
    });
}

//Signup
function signUp() {
    $('#sign-up-error').css('display', 'none');
    $('.form-control').css('border', '1px solid #ced4da');
    $.ajax({
        url: '/sign_up',
        data: $('form').serialize(),
        type: 'POST',
        success: function(response){
            console.log(response)
            console.log($("input[name=email]").val())
            if (typeof(response) == 'object'){
                $('#sign-up-error').text('* All fields are required');
                //$('#sign-up-error').css('display', 'block');
                showElement($('#sign-up-error'))
                for (const [key, value] of Object.entries(response)) {
                    if(!value || value == null){
                        $(`input[name=${key}]`).css('border', '1px solid #c93939');
                    }
                }
            }
            else if (response == "Password and confirm Password don't match"){
                $("input[name=password]").css('border', '1px solid #c93939')
                $("input[name=re_password]").css('border', '1px solid #c93939')
                $('#sign-up-error').text(`* ${"Password and confirm Password don't match"}`);
                $('#sign-up-error').css('display', 'block');
            }
            else if (response == "This Email is already registered"){
                $('#sign-up-error').text(`* ${response}`);
                showElement($('#sign-up-error'))
                //$('#sign-up-error').css('display', 'block');
            }
            else{
                location.reload();
            }

        },
        error: function(error){
            console.log('error');
        }
    });
}

// Logout
function logout(){
    $.ajax({
        url: '/logout',
        type: 'GET',
        success: function(response){
            location.reload();
        },
        error: function(error){
            console.log('error');
        }
    });
}

/**
 * Animate slider btns and update styling based on index
 * @param  {Node} slider_btn Selected btn
 * @param  {String} index  index at which user at in slider
 * @param  {String} max_index  max index to be reached
 */
function adjustSliderBtns(slider_btn, index, max_index){

    if(index > 0){
        $("#bck", slider_btn.parent()).css('border-color', 'black');
        $("#bck svg path", slider_btn.parent()).css('fill', 'black');
    }
    else{
        $("#bck", slider_btn.parent()).css('border-color', 'grey');
        $("#bck svg path", slider_btn.parent()).css('fill', 'grey');
    }
    if(index == max_index){
        $("#fwd", slider_btn.parent()).css('border-color', 'grey')
        $("#fwd svg path", slider_btn.parent()).css('fill', 'grey');
    }
    else{
        $("#fwd", slider_btn.parent()).css('border-color', 'black')
        $("#fwd svg path", slider_btn.parent()).css('fill', 'black');
    }
}

/**
 * Adding item to DB if it doesn't existst and also to user view history DB
 * @param  {String} itemId item to be added
 */
function viewItem(itemId){
    $.ajax({
        url: '/view_item',
        data:{'volume_id': itemId},
        type: 'GET',
        success: function(response){
            console.log(response);
        },
        error: function(error){
            console.log('error');
        }
    });
}   

/**
 * Animating sliding items and updating variables
 * @param  {Node} sliderBtn Btn to take effect
 */
function slideItems(sliderBtn){
    
    let listContent = $('.list-content', sliderBtn.siblings('.list-window'));
    let totalElements = listContent.children().length;
    let sliderWidth = Math.round(listContent.width()/16) + 5;
    let step = sliderWidth;
    let index = Math.abs(listContent.css('transform').split(',')[4] / 16);
    let max_index = Math.ceil((totalElements / (sliderWidth / 14)) - 1) * sliderWidth;

    if (sliderBtn.attr('id') == 'fwd')
    {
        if (index < max_index && index%14 == 0) {
            index+=step;
            listContent.css("transform", `translateX(-${index}rem`)

        }
    }
    else if(sliderBtn.attr('id') == 'bck')
    {
        if (index > 0  && index%14 == 0) {
            index-=step;
            listContent.css("transform", `translateX(-${index}rem`)
        }
    }
    adjustSliderBtns(sliderBtn, index, max_index);

}

/**
 * Toggle visibility of a content tab
 * @param  {Node} selector Selector for the element
 */
function rangeValue(element){
    value = element.val()
    $('.page-count-no').text(value);
    $('#page-count-no').val(value);
}

/**
 * change css property value
 * @param  {String} property property to be changed 
 * @param  {String}  vlaue   value to be added
 */
function changePropertyValue(property, value){
    $(this).css(property, value);
    console.log(property);
}


/**
 * reset filter attr selection in usr items
 * @param  {Node} element deselcting all attr
 */
function resetSelection(element){
    element.attr('data-select', '0');
    element.toggleClass('grey-background');
}


/**
 * Selecting or deselecing filter value
 * @param  {Node} element element to selectdeselect
 */
function selectDeselectElement(element){
    if (element.attr('data-select') == 0){
        element.attr('data-select', '1');
    }
    else{
        element.attr('data-select', '0');
    }

}


/**
 * Updating filter attr based on data-select
 * @param  {Node} element The element that triggered the tab
 */
function upadteFilterAttrSelect(element){
    selectedAttributsLen = `(${$('[data-select=1]', element).length})`;
    $('inline', element).text(selectedAttributsLen);
}

/**
 * Updating filter Range attr based on selection
 * @param  {String} element Selector for the element
 */
function upadteFilterAttrRange(element){
    selectedAttributsVal = element.val();
    $(`.${element.attr('id')}`).text(selectedAttributsVal);

}


/**
 * Displaying chart for book insights
 * @param  {String} item_id item to display 
 */
function displayChart(item_id){
    $.ajax({
        url: '/return_chart_data',
        data:{'item_id': item_id},
        type: 'GET',
        success: function(response){
            chart.data.datasets[0].data[0] = response['To read'];
            chart.data.datasets[0].data[1] = response['Have read'];
            chart.data.datasets[0].data[2] = response['Reading'];
            chart.update();
        },
        error: function(error){
            console.log('error');
        }
    });

}

$(document).ready(function() {

    $("#my-collection-link").click(function() {
        directMyBooks()
    });


    $('#sign-in').click(function(){
        signIn();
    });

    $('#custom-modal').click(function(){
        
    });

    $('.tab').click(function(){
        switchTab($(this));
    });

    getMyBooksCount();

    $(".card-body, .list-item, #sign-in-up").click(function(){
        openModal($(this));
    });

    $(".card, .list-item").click(function(){
        display_info($(this).data('item-id'));
        getBrowseHistory(1);
    });

    $('#close-btn, .modal-layer').click(function(){
        closeModal($(this))
    });

    $('.shelf-menu li').click(function(){
        set_shelf($(this).data('label'))
    });
    
    try{
        insertItems(items['shelves']);
    }
    catch(err){
        console.log('Nothing to Insert in this page')
    }


    $("#favourite").click(function(){
        update_favourits($(this).data('item-id'))
        getMyBooksCount();
    });

    $(".book-shelf").click(function(){
        update_shelf($(this).data('item-id'));
        getMyBooksCount();
    });

    $("#logged-in-msg, .filter-attr, .sort-attr").mouseenter(function () {
        $(".filter-dropdown, .user-list", this).css('display', 'block');
    });

    $("#logged-in-msg, .filter-attr, .sort-attr").mouseleave(function() {
        $(".filter-dropdown").css('display', 'none');
    });

    $('#logout').click(function(){
        logout();
        window.location.replace("http://127.0.0.1:5000/");
    })

    $("#page-count-no, #year-from, #year-to").change(function(){
        upadteFilterAttrRange($(this))
      });
    
    $(".dropdown-item, #footer-icon-name").click(function() {
        if ($(this).parent().parent().parent().attr('class') == 'sort-attr'){
            resetSelection($(this).parent().parent().children().children('[data-select=1]'));
            $(this).parent().parent().siblings('span').children('p').text($(this).text())
        }
        $(this).toggleClass('grey-background');
        selectDeselectElement($(this));
        upadteFilterAttrSelect($(this).parent().parent().parent())
    });

    $("#page-count-no").change(function(){
        value = $(this).val();
        $("#page-count-range").val(value)

    });


    $("#page-count-range").click(function(){
        rangeValue($(this));

    });

    $(".slider-btn").click(function() {
        slideItems($(this))
    });

    $("#append").click(function() {
        appendPermession($(this).data('order'))
    });
    
    $("#discard").click(function() {
        appendPermession($(this).data('order'))
    });

    getBrowseHistory(1);


    $('.sort-attr .dropdown-item, #footer-icon-name').click(function(){
        insertItems(items['shelves'] ? items['shelves'] : items);
        resetSlider($(this).parent().parent().parent().parent().parent().parent());
    });
    
    $(".filter-btn").click(function() {
        filterItems();
    });


    $("#reset").click(function() {
        resetFilter();
    });

    $("#about").click(function(){
        window.location.href = "/about";
    });


    if(performance.navigation.type === 2) {
        // type is 2 when the back button is click
        location.reload(true);
     }

     ObjectifyItems(items)
});


