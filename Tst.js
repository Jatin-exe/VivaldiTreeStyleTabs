let tab_ids_str = [];
// if data about current tabs is stored load it 


// builds the tab structure and returns it 
function createTabElement(tabNode) {
    var tabElement = document.createElement("div");
    tabElement.id = "tst-" + tabNode.id;
    tabElement.classList.add("tst-tab");
    
    tabElement.setAttribute("draggable",true);
    
    var tabBar = document.createElement("span");
    

    // Favicon | Arrow Btn
    var favIcon = document.createElement("span"); // class favicon, jstest-favicon-image
    favIcon.classList.add("tst-tabicon");


    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '10');
    svg.setAttribute('height', '10');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // fill 0000 stroke 00000
    path.setAttribute('d', 'M51.707,185.343c-2.741,0-5.493-1.044-7.593-3.149c-4.194-4.194-4.194-10.981,0-15.175 l74.352-74.347L44.114,18.32c-4.194-4.194-4.194-10.987,0-15.175c4.194-4.194,10.987-4.194,15.18,0l81.934,81.934 c4.194,4.194,4.194,10.987,0,15.175l-81.934,81.939C57.201,184.293,54.454,185.343,51.707,185.343z');
    svg.appendChild(path);

    favIcon.appendChild(svg);



    var favImg  = document.createElement("img");
    favImg.setAttribute('width','16');
    favImg.setAttribute('height','16');
    favImg.setAttribute('src',tabNode.favIconUrl); // or default 
    favIcon.appendChild(favImg);


    tabElement.appendChild(favIcon);

    favIcon.addEventListener('click',function(e){
        if(subMenu.style.display == "none"){
            subMenu.style.display = "block";
        }else{
            subMenu.style.display = "none";
        }
    });

    

    // Title 
    var titleSpan = document.createElement("span");
    titleSpan.classList.add("tst-title");
    titleSpan.textContent = tabNode.title;
    tabBar.appendChild(titleSpan);

    // X button 
    var closeBtn = document.createElement("button");
    closeBtn.setAttribute('title', 'Close Tab\nAlt click to close other tabs except this one'); // vivaldi thingy

    closeBtn.addEventListener('click',function(e){
        console.log("close btn clicked");
        chrome.tabs.remove(tabNode.id); 
    });

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'm12.5 5-1.4-1.4-3.1 3-3.1-3L3.5 5l3.1 3.1-3 2.9 1.5 1.4L8 9.5l2.9 2.9 1.5-1.4-3-2.9');

    svg.appendChild(path);
    closeBtn.appendChild(svg);
    tabBar.appendChild(closeBtn);
    
    tabElement.appendChild(tabBar);


    var subMenu = document.createElement("div");
    subMenu.classList.add("tst-submenu");
    tabElement.appendChild(subMenu);


    // adding click feature
    tabBar.addEventListener('click',function(e){
        console.log("tab id click: " + tabNode.id);
        chrome.tabs.update(tabNode.id,{active:true});
    });
    return tabElement;
}



var tabbarWrapper = document.querySelectorAll(".tabbar-wrapper");
tabbarWrapper = tabbarWrapper[1]; // not sure how wise this is 

tabbarWrapper.classList.add("tst-tabbar-wrapper");



var tstBar = document.createElement("div");
tstBar.classList.add("tst-bar");

var tstGutter = document.createElement("div");
tstGutter.classList.add("tst-gutter");




chrome.tabs.query({ currentWindow: true }, function(tabs) {
    tabs.forEach(function(tab){

        var tabElement = createTabElement(tab);

        tstBar.appendChild(tabElement);

    });
});


tabbarWrapper.appendChild(tstBar);
tabbarWrapper.appendChild(tstGutter);


chrome.tabs.onCreated.addListener(function(tab){

    if (tab.openerTabId !== undefined ){

    //    console.log("yeahh, new tab opened via link , Title:" + tab.title);

        var tabElement = createTabElement(tab);
        var actTab = document.getElementById('tst-'+tab.openerTabId);
        var subMenu = actTab.querySelector(".tst-submenu");

        subMenu.appendChild(tabElement);



    }

    if (tab.openerTabId === undefined){
   //     console.log("New tab blank tab", tab.status);// no push? 

        var tabElement = createTabElement(tab);
        tstBar.appendChild(tabElement);
    }

    chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,updatedTab) {
        // use updatedTab not tab
        var t1 = toString(tabId).split("-");
        t1 = t1[t1.length -1];
        console.log("tab updated", changeInfo);
        var t2 = toString(tab.id).split("-");
        t2 = t2[t2.length -1];

//        console.log("taId :", t1, t2, "changeInfo : ", changeInfo, "title :", updatedTab.title != tab.title, "favicon :", updatedTab.favIconUrl != tab.favIconUrl, "tab equal:", t1 == t2 , t1, t2);
        if (( updatedTab.title != tab.title || updatedTab.favIconUrl != tab.favIconUrl) && t1 == t2 ){
            // updating the tab title and icon
            
            tab = document.getElementById('tst-' + tabId);
            var x = tab.querySelector(".tst-title");
            x.textContent = updatedTab.title;
 //           console.log("updated title : ",updatedTab.title);

            x = tab.querySelector("img");
            x.setAttribute("src",updatedTab.favIconUrl);
  //          console.log("updated favIcon : ",updatedTab.favIconUrl);
    
        }



    });

});


chrome.tabs.onRemoved.addListener(function(tabId){
    console.log("Tab closed id :" + tabId);
    var tabElement = document.getElementById("tst-" + tabId);

    tabElement.remove();


});


const getMouseOffset = (evt) => {
  const targetRect = evt.target.getBoundingClientRect()
  const offset = {
    x: evt.pageX - targetRect.left,
    y: evt.pageY - targetRect.top
  }
//  console.log("x:"+offset.x+ " y:"+offset.y);
  return offset
}

const getElementVerticalCenter = (el) => {
  const rect = el.getBoundingClientRect()
  return (rect.bottom - rect.top) / 2
}


   var dragEl;
   
   // Making all siblings movable
//   [].slice.call(tstBar.children).forEach(function (itemEl) {
//       itemEl.draggable = true;
//   });
   
   // Function responsible for sorting
   function _onDragOver(evt) {
       evt.preventDefault();
       evt.dataTransfer.dropEffect = 'move';
      
       var target = evt.target;
       if (target && target !== dragEl && target.nodeName == 'DIV') {
           // Sorting
           const offset = getMouseOffset(evt)
           const middleY = getElementVerticalCenter(evt.target)

          if (offset.y > middleY) {
            tstBar.insertBefore(dragEl, target.nextSibling)
          } else {
            tstBar.insertBefore(dragEl, target)
          }
     }
   }
   
   function _onDragEnd(evt){
       evt.preventDefault();
      
       tstBar.removeEventListener('dragover', _onDragOver, false);
       tstBar.removeEventListener('dragend', _onDragEnd, false);


   }
   
   // Sorting starts
   tstBar.addEventListener('dragstart', function (evt){
       dragEl = evt.target; // Remembering an element that will be moved
       
       // Limiting the movement type
       evt.dataTransfer.effectAllowed = 'move';
       evt.dataTransfer.setData('Text', dragEl.textContent);


       // Subscribing to the events at dnd
       tstBar.addEventListener('dragover', _onDragOver, false);
       tstBar.addEventListener('dragend', _onDragEnd, false);


   }, false);
                       










// turn off tabs from settings through js, we can also inspect settings using this lmao noice (ig) 
// this has two tabbar-wrapper assumption 
// and last one is the one we need to inject in
//
//
// replace default favicon wth something u want 
// flroop browser firefox based 
//
//
//
// tabNode also contains window_id 
//
//
// the title is in cache thats hwy vivaldi tabs rendign is fast
//
// arc browser features, show only the favicon and stuff, and show the tree through the favIconUrl
//
// toggle killing root kills all childs ? yes or no 
//
// no subscript of arrow for no of subtabs open
