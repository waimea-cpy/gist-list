const USER = 'waimea-cpy';
// const USER = 'stevecopley';

let gistList = [];
let filters = [];

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


async function filterGists( filter ) {
    if( filters.includes( filter ) ) {
        filters = filters.filter( ( e ) => e != filter );
    } else {
        filters.push( filter );
    }
    showGists();
    updateMenus();
}


async function showAllGists() {
    filters = [];
    showGists();
    updateMenus();
}

async function showGists() {
    let listSection = document.getElementById( 'gistlist' );
    listSection.innerHTML = '';
    let gistCount = 0;

    gistList.forEach( gist => {
        let show = true;

        if( filters.length > 0 ) {
            filters.forEach( filter => {
                if( !gist.tags.includes( filter ) && !gist.languages.includes( filter ) ) {
                    show = false;
                }
            } );
        }

        if( show ) {
            showGist( gist );
            gistCount++;
        }
    } );

    if( gistCount == 0 ) {
        let heading = document.createElement( 'h2' );
        heading.textContent = 'No gists';
        if( filters.length > 0 ) {
            heading.textContent = 'No gists match the selected tags / languages';
        }
        else {
            heading.textContent = 'No gists for ' + USER;
        }

        document.getElementById( 'gistlist' ).appendChild( heading );
    }
}


async function createMenus() {
    let tags = [];
    let langs = [];

    gistList.forEach( gist => {
        gist.tags.forEach( tag => {
            if( !tags.includes( tag ) ) tags.push( tag );
        } );
        gist.languages.forEach( lang => {
            if( !langs.includes( lang ) ) langs.push( lang );
        } );
    } );

    tags.sort();
    langs.sort();

    tags.forEach( tag => {
        let tagItem = document.createElement( 'li' );
        document.getElementById( 'tagmenu' ).appendChild( tagItem );
        tagItem.textContent = tag;
        tagItem.onclick = function () { filterGists( tag ) };
    } );

    langs.forEach( lang => {
        let langItem = document.createElement( 'li' );
        document.getElementById( 'langmenu' ).appendChild( langItem );
        langItem.textContent = lang;
        langItem.onclick = function () { filterGists( lang ) };
    } );
}

async function updateMenus() {
    document.getElementById( 'tagmenu' ).childNodes.forEach( item => {
        item.className = '';
        if( filters.includes( item.textContent ) ) {
            item.classList.add( 'active' );
        }
    } );

    document.getElementById( 'langmenu' ).childNodes.forEach( item => {
        item.className = '';
        if( filters.includes( item.textContent ) ) {
            item.classList.add( 'active' );
        }
    } );
}


async function showUserInfo() {
    let userURL = 'https://github.com/' + USER;
    let userAvatarURL = userURL + '.png';

    document.getElementById( 'username' ).textContent = USER;
    document.getElementById( 'userlink' ).href = userURL;
    document.getElementById( 'avatar' ).src = userAvatarURL;
    document.getElementById( 'avatar' ).alt = 'Avatar of ' + USER;
}

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

    // Check for #tags
    while( info.includes( '#' ) ) {
        let tagStart = info.lastIndexOf( '#' );
        let tag = info.slice( tagStart );
        tag = tag.trim();
        tags.push( tag );
        info = info.substr( 0, tagStart - 1 );
    }

    // Check if using CodeExpander title format: [TITLE] DESC #TAG #TAG
    if( info.includes( '[' ) && info.includes( ']' ) ) {
        let titleStart = info.indexOf( '[' ) + 1;
        let titleEnd = info.indexOf( ']' );
        title = info.substr( titleStart, titleEnd - titleStart );
        desc = info.slice( titleEnd + 2 );
    }
    else {
        title = info;
    }

    Object.keys( gist.files ).forEach( file => {
        let lang = gist.files[file].language.toLowerCase();
        if( !langs.includes( lang ) ) langs.push( lang );
    } );

    gist.title = title;
    gist.description = desc;
    gist.tags = tags;
    gist.languages = langs;
}


async function showGist( gist ) {
    // console.log( gist );

    let listSection = document.getElementById( 'gistlist' );

    let gistDiv = document.createElement( 'div' );
    listSection.appendChild( gistDiv );
    gistDiv.classList.add( 'gist' );

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

    gistLink.textContent = gist.title;
    gistLink.href = gist.html_url;
    gistLink.target = "_blank";
    gistDesc.textContent = gist.description;

    gist.tags.forEach( tag => {
        let gistTag = document.createElement( 'li' );
        gistTags.appendChild( gistTag );
        gistTag.textContent = tag;
        gistTag.onclick = function () { filterGists( tag ) };
        if( filters.includes( tag ) ) gistTag.classList.add( 'filter' );
    } );

    gist.languages.forEach( lang => {
        let gistLang = document.createElement( 'li' );
        gistLangs.appendChild( gistLang );
        gistLang.textContent = lang;
        gistLang.onclick = function () { filterGists( lang ) };
        if( filters.includes( lang ) ) gistLang.classList.add( 'filter' );
    } );

    Object.keys( gist.files ).forEach( index => {
        let file = gist.files[index];
        // console.log( file );
        let lang = file.language.toLowerCase();
        let gistFile = document.createElement( 'li' );
        gistFiles.appendChild( gistFile );
        gistFile.classList.add( lang );
        gistFile.textContent = file.filename;
        gistFile.onclick = function () { showFileViewer( file ) };
    } );
}

async function showFileViewer( file ) {
    let code = document.getElementById( 'gistfilecode' );
    code.innerHTML = '';
    document.getElementById( 'gistfile' ).classList.add( 'visible' );

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


function closeFileViewer() {
    document.getElementById( 'gistfile' ).classList.remove( 'visible' );
}
