const nav_link = document.getElementsByClassName('nav-link');
let menu_list_arr =[];
for (let i = 0; i < nav_link.length; i++) {
    const nav_list = nav_link[i].textContent;
    // console.log("상위 메뉴:", nav_list);

    const nav_parents = nav_link[i].parentElement;
    const sub_menus = nav_parents.getElementsByTagName('ul');
    const sub_menu = sub_menus[0].getElementsByTagName('a');

    let sub_menu_arr = [];
    for (let j = 0; j < sub_menu.length; j++) {
        // console.log("  하위 메뉴:", sub_menu[j].textContent);
        sub_menu_arr.push(sub_menu[j].textContent);
    }
    // console.log(sub_menu_arr);

    menu_list_arr.push({
        menu_name : nav_list,
        menu_items : sub_menu_arr
    });
}

// console.log(menu_list_arr);
let nav_texts ="";
for(let i=0; i<menu_list_arr.length; i++){
    nav_texts += menu_list_arr[i].menu_name;

    for(let j=0; j<menu_list_arr[i].menu_items.length; j++){
        nav_texts += menu_list_arr[i].menu_items[j];
    }
}
// console.log(nav_texts);
// console.log(nav_texts.includes("경영"));

localStorage.setItem("nav_item_list_json",JSON.stringify(menu_list_arr));
localStorage.setItem("nav_item_list",nav_texts);
const json_items = JSON.parse(localStorage.getItem("nav_item_list_json"));
// console.log(json_items);

const searchResults = document.getElementById("searchResults");
// console.log(localStorage.getItem("nav_item_list"));
const items_txt = localStorage.getItem("nav_item_list");
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function() {
    const keyword = this.value.trim();
    // console.log(keyword);

    searchResults.innerHTML = ""; // 이전 결과 초기화
    if (!keyword) return; // 빈값이면 종료
    
    if(items_txt.includes(keyword)){
        // console.log(keyword+" 포함되어있는 내용"+json_items.length);
        for(i=0;i<json_items.length;i++){
            // if(keyword.includes(json_items[i].menu_name)){
            //     console.log("check!");
            // }
            for(j=0;j<json_items[i].menu_items.length;j++){
                // console.log(json_items[i].menu_items[j]+"요기");
                if(json_items[i].menu_items[j].trim().includes(keyword)){
                    // console.log(json_items[i].menu_name+"메뉴이름");
                    const now_menu = json_items[i].menu_name;
                    // console.log(json_items[i].menu_items[j]+"하위메뉴");
                    const now_munu_sub = json_items[i].menu_items[j];
                    // console.log(`${now_menu} > ${now_munu_sub}`);
                
                    const resultItem = document.createElement("a");
                    resultItem.classList.add("list-group-item");
                    resultItem.textContent = `${now_menu} >> ${now_munu_sub}`;
                    resultItem.href = "#";
                    // 링크는 처음 setItem부터 링크가 포함된 내용을 json으로 저장 하고 파싱까지 해서 넣으면 될 듯.
                    searchResults.appendChild(resultItem);
                }
            }

        }
    }
});

const menuBtn = document.getElementById('menu_button');
const menuList = document.getElementById('menu_list');

menuBtn.addEventListener('click', () => {
  menuList.classList.toggle('show');
});