/*-----------------------------------------------------------------------------------------
  User account whose gists to show
-----------------------------------------------------------------------------------------*/
const USER = 'waimea-cpy';
// const USER = 'stevecopley';

/*-----------------------------------------------------------------------------------------
  Global storage for the gists and for filter terms
-----------------------------------------------------------------------------------------*/
let gistList = [];
let filters = [];

/*-----------------------------------------------------------------------------------------
  Request gists for the user via GitHub API
-----------------------------------------------------------------------------------------*/
async function fetchGists() {
    showUserInfo();

    try {
        const response = await fetch( 'https://api.github.com/users/' + USER + '/gists' );
        gistList = await response.json();

        if( Object.keys( gistList ).length > 0 ) {
            gistList.forEach( gist => analyseGist( gist ) );
            gistList.sort( ( a, b ) => ( a.title > b.title ) ? 1 : -1 );
        }

        showGists();
        createMenus();
    }
    catch( error ) {
        console.log( "Error: " + error );
    }
}


/*-----------------------------------------------------------------------------------------
  Takes a given filter term, toggles it within the filter list, then updates list and menu
-----------------------------------------------------------------------------------------*/
async function filterGists( filter ) {
    if( filters.includes( filter ) ) {
        filters = filters.filter( ( e ) => e != filter );
    } else {
        filters.push( filter );
    }
    showGists();
    updateMenus();
}


/*-----------------------------------------------------------------------------------------
  Clear the filter terms and update list and menu to show all gists
-----------------------------------------------------------------------------------------*/
async function showAllGists() {
    filters = [];
    showGists();
    updateMenus();
}


/*-----------------------------------------------------------------------------------------
  Show the user's gists, filtered by the terms within the filter list
-----------------------------------------------------------------------------------------*/
async function showGists() {
    let listSection = document.getElementById( 'gistlist' );
    listSection.innerHTML = '';
    let gistCount = 0;

    // Work thru all gists
    gistList.forEach( gist => {
        let show = true;

        // Any filtering?
        if( filters.length > 0 ) {
            // Yes, so work thru filter terms
            filters.forEach( filter => {
                // Reject gist if not caught by a filter term
                if( !gist.tags.includes( filter ) && !gist.languages.includes( filter ) ) {
                    show = false;
                }
            } );
        }

        // Should we show it?
        if( show ) {
            showGist( gist );
            gistCount++;
        }
    } );

    // Did we end up showing no gists?
    if( gistCount == 0 ) {
        let heading = document.createElement( 'h2' );

        // Was it due to filtering?
        if( filters.length > 0 ) {
            heading.textContent = 'No gists match the selected tags / languages';
        }
        // Or rather because the user has no gists!
        else {
            heading.textContent = 'No gists for ' + USER;
        }

        document.getElementById( 'gistlist' ).appendChild( heading );
    }
}


/*-----------------------------------------------------------------------------------------
  Parses all gists, creating a global list of tags and languages, then adds nav menu items
-----------------------------------------------------------------------------------------*/
async function createMenus() {
    let tags = [];
    let langs = [];

    // Process all gists
    gistList.forEach( gist => {
        // Work thru all gist tags, adding to global list if not already present
        gist.tags.forEach( tag => {
            if( !tags.includes( tag ) ) tags.push( tag );
        } );
        // And likewise for languages
        gist.languages.forEach( lang => {
            if( !langs.includes( lang ) ) langs.push( lang );
        } );
    } );

    // Tidy up our lists
    tags.sort();
    langs.sort();

    // Create menu items for each tag in the global list
    tags.forEach( tag => {
        let tagItem = document.createElement( 'li' );
        document.getElementById( 'tagmenu' ).appendChild( tagItem );
        tagItem.textContent = tag;
        tagItem.onclick = function () { filterGists( tag ) };
    } );

    // And also items for each language
    langs.forEach( lang => {
        let langItem = document.createElement( 'li' );
        document.getElementById( 'langmenu' ).appendChild( langItem );
        langItem.textContent = lang;
        langItem.onclick = function () { filterGists( lang ) };
    } );
}


/*-----------------------------------------------------------------------------------------
  Works thru the nav menu, highlighting any items that are presently used for filtering
-----------------------------------------------------------------------------------------*/
async function updateMenus() {

    // Work thru the tag menu
    document.getElementById( 'tagmenu' ).childNodes.forEach( item => {
        item.className = '';
        // Make item active if it appears in filter list
        if( filters.includes( item.textContent ) ) {
            item.classList.add( 'active' );
        }
    } );

    // And the same for languages
    document.getElementById( 'langmenu' ).childNodes.forEach( item => {
        item.className = '';
        if( filters.includes( item.textContent ) ) {
            item.classList.add( 'active' );
        }
    } );
}


/*-----------------------------------------------------------------------------------------
  Show the user avatar, username and links to their GitHub account page
-----------------------------------------------------------------------------------------*/
async function showUserInfo() {
    let userURL = 'https://github.com/' + USER;
    let userAvatarURL = userURL + '.png';

    document.getElementById( 'username' ).textContent = USER;
    document.getElementById( 'userlink' ).href = userURL;
    document.getElementById( 'avatar' ).src = userAvatarURL;
    document.getElementById( 'avatar' ).alt = 'Avatar of ' + USER;
}


/*-----------------------------------------------------------------------------------------
  Parses a given gist to remove meta info, extract tags and seperate out title if given. 
  Plainly titled gists are handled just fine, but works ebtter with those stored via apps
  like Lepton and CodeExpander
  Note: CodeExpander adds meta data to description, preceeded by '|-|' - ignored
        Lepton adds a title within [...] and tags preceeded by # - processed
-----------------------------------------------------------------------------------------*/
async function analyseGist( gist ) {
    let info = gist.description;
    let title = '';
    let desc = '';
    let tags = [];
    let langs = [];

    // Check if using CodeExpander format: |-|{META DATA}
    if( info.includes( '|-|' ) ) {
        let metaStart = info.indexOf( '|-|' );
        info = info.substr( 0, metaStart - 2 );
    }

    // Check for Lepton tag format: #tag1 #tag2 #tag3 ...
    while( info.includes( '#' ) ) {
        let tagStart = info.lastIndexOf( '#' );
        let tag = info.slice( tagStart );
        tag = tag.trim();
        tags.push( tag );
        info = info.substr( 0, tagStart - 1 );
    }

    // Check if using Lepton title format: [TITLE] DESC #TAG #TAG
    if( info.includes( '[' ) && info.includes( ']' ) ) {
        let titleStart = info.indexOf( '[' ) + 1;
        let titleEnd = info.indexOf( ']' );
        title = info.substr( titleStart, titleEnd - titleStart );
        desc = info.slice( titleEnd + 2 );
    }
    else {
        title = info;
    }

    // Work thru the file list
    Object.keys( gist.files ).forEach( file => {
        let lang = gist.files[file].language.toLowerCase();
        if( !langs.includes( lang ) ) langs.push( lang );
    } );

    // Store parsed data back into the gist object
    gist.title = title;
    gist.description = desc;
    gist.tags = tags;
    gist.languages = langs;
}


/*-----------------------------------------------------------------------------------------
  Create a card for a given gist with title, description, file list and tags
-----------------------------------------------------------------------------------------*/
async function showGist( gist ) {
    let listSection = document.getElementById( 'gistlist' );

    // Create and add card to list
    let gistDiv = document.createElement( 'div' );
    listSection.appendChild( gistDiv );
    gistDiv.classList.add( 'gist' );

    // Build structure
    let gistHeader = document.createElement( 'header' );
    let gistFooter = document.createElement( 'footer' );
    let gistHeading = document.createElement( 'h3' );
    let gistLink = document.createElement( 'a' );
    let gistDesc = document.createElement( 'p' );
    let gistFiles = document.createElement( 'ul' );
    let gistTags = document.createElement( 'ul' );
    let gistLangs = document.createElement( 'ul' );

    gistDiv.appendChild( gistHeader );
    gistDiv.appendChild( gistDesc );
    gistDiv.appendChild( gistFiles );
    gistDiv.appendChild( gistFooter );

    gistHeader.appendChild( gistHeading );
    gistHeading.appendChild( gistLink );

    gistFooter.appendChild( gistLangs );
    gistFooter.appendChild( gistTags );

    gistFiles.classList.add( 'files' );
    gistTags.classList.add( 'tags' );
    gistLangs.classList.add( 'langs' );

    // Gist title heading and link to gist on GitHub
    gistLink.textContent = gist.title;
    gistLink.href = gist.html_url;
    gistLink.target = "_blank";
    gistDesc.textContent = gist.description;

    // Add tags to footer
    gist.tags.forEach( tag => {
        let gistTag = document.createElement( 'li' );
        gistTags.appendChild( gistTag );
        gistTag.textContent = tag;
        // Click triggers filtering on this tag
        gistTag.onclick = function () { filterGists( tag ) };
        // Highlight if being filtered by this tag
        if( filters.includes( tag ) ) gistTag.classList.add( 'filter' );
    } );

    // And languages to footer
    gist.languages.forEach( lang => {
        let gistLang = document.createElement( 'li' );
        gistLangs.appendChild( gistLang );
        gistLang.textContent = lang;
        // Click triggers filtering on this language
        gistLang.onclick = function () { filterGists( lang ) };
        // Highlight if being filtered by this language
        if( filters.includes( lang ) ) gistLang.classList.add( 'filter' );
    } );

    // Create a list of files
    Object.keys( gist.files ).forEach( index => {
        let file = gist.files[index];
        let lang = file.language.toLowerCase();
        let gistFile = document.createElement( 'li' );
        gistFiles.appendChild( gistFile );
        gistFile.classList.add( lang );
        gistFile.textContent = file.filename;
        // Click throws up a file viewer
        gistFile.onclick = function () { showFileViewer( file ) };
    } );
}


/*-----------------------------------------------------------------------------------------
  Obtain the raw code for the given gist file, add the content to a viewer, run the 
  syntax highlighter and show the viewer
-----------------------------------------------------------------------------------------*/
async function showFileViewer( file ) {
    console.log( file );

    let viewer = document.getElementById( 'gistfile' );
    let code = document.getElementById( 'gistfilecode' );
    let filename = document.getElementById( 'gistfilename' );
    let fileinfo = document.getElementById( 'gistfileinfo' );

    code.innerHTML = 'Loading...';
    filename.textContent = file.filename;
    fileinfo.textContent = file.language + ' (' + file.size + ' chars)';

    viewer.classList.add( 'visible' );

    try {
        const response = await fetch( file.raw_url );
        let gist = await response.text();

        code.textContent = gist;
        code.className = file.language.toLowerCase();
        hljs.highlightAll();
    }
    catch( error ) {
        console.log( "Error: " + error );
    }
}


/*-----------------------------------------------------------------------------------------
  Close the file viewer
-----------------------------------------------------------------------------------------*/
function closeFileViewer() {
    document.getElementById( 'gistfile' ).classList.remove( 'visible' );
}
