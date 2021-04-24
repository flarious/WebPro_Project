const buttons = document.querySelectorAll(".item_button");
for(let button of buttons)
{
    if(button.classList.contains("download"))
    {
        if(button.classList.contains("free"))
        {
            button.addEventListener("mouseover", buyPremium);
        }
        else if(button.classList.contains("premium"))
        {
            button.addEventListener("click", download);
        }
    }
    else if(button.classList.contains("favorite") || button.classList.contains("not-favorite"))
    {
        button.addEventListener("click", toggleFavorite);
    }
}

function toggleFavorite()
{
    let clicked = event.currentTarget;
    if(clicked.classList.contains("favorite"))
    {
        clicked.classList.remove("favorite");
        clicked.classList.add("not-favorite");
        clicked.src = "/favoriteIcon_not-favorite.png";
    }
    else if(clicked.classList.contains("not-favorite"))
    {
        clicked.classList.remove("not-favorite");
        clicked.classList.add("favorite");
        clicked.src = "/favoriteIcon_favorite.png";
    }
}

function buyPremium()
{
    let hovered = event.currentTarget;
    hovered.title = "Please buy premium to use this feature";
}

function download()
{
    let clicked = event.currentTarget;
    
}