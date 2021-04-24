const search_input = document.querySelector("#search");
search_input.addEventListener("keypress", submit);

function submit(input)
{
    let path = window.location.pathname;
    if(input.key === "Enter")
    {
        window.location.pathname = goToSearchResults(path, search_input.value);
    }
}

function goToSearchResults(path, value)
{
    let path_arr = path.split('/');
    let newPath = "";

    if(path_arr.includes("searchResults"))  // If the user have searched before
    {
        path_arr.pop();     // Pop the last search results
        path_arr.pop();     // Pop the "searchResults" path
    }
    
    newPath += path_arr.join('/');

    if(path_arr.length >= 3)    // If the user search from other page than the home page
    {
        newPath += "/";
    }
    
    newPath += 'searchResults/' + value;
    return newPath;

}
