async function fetchGists() {
    try {
        const response = await fetch( 'https://api.github.com/users/waimea-cpy/gists' );
        const gistList = await response.json();
        showGists( gistList );
    }
    catch( error ) {
        console.log( "Error: " + error );
    }
}

async function showGists( gistList ) {

    if( Object.keys( gistList ).length > 0 ) {
        let userDetails = gistList[0].owner;
        let username = userDetails.login;
        let userURL = userDetails.html_url;
        let userAvatarURL = userDetails.avatar_url;

        document.getElementById( 'username' ).textContent = username;
        document.getElementById( 'userlink' ).href = userURL;
        document.getElementById( 'avatar' ).src = userAvatarURL;
        document.getElementById( 'avatar' ).alt = 'Avatar of ' + username;

        // TODO: need to get this sorting working
        const array = Object.keys( gistList ).map( key => gistList[key] );
        array.sort( ( A, B ) => A.description - B.description );

        array.forEach( gist => showGist( gist ) );
    }
    else {
        document.getElementById( 'gistlist' ).textContent = 'No gists!';
    }
}

async function showGist( gist ) {
    let listSection = document.getElementById( 'gistlist' );

    let gistDiv = document.createElement( 'div' );
    listSection.appendChild( gistDiv );
    gistDiv.classList.add( 'gist' );

    let gistHeader = document.createElement( 'header' );
    let gistFooter = document.createElement( 'footer' );
    let gistHeading = document.createElement( 'h3' );
    let gistDesc = document.createElement( 'p' );
    let gistFiles = document.createElement( 'ul' );
    let gistTags = document.createElement( 'ul' );
    let gistLangs = document.createElement( 'ul' );

    gistDiv.appendChild( gistHeader );
    gistDiv.appendChild( gistDesc );
    gistDiv.appendChild( gistFiles );
    gistDiv.appendChild( gistFooter );

    gistHeader.appendChild( gistHeading );

    gistFooter.appendChild( gistLangs );
    gistFooter.appendChild( gistTags );

    gistFiles.classList.add( 'files' );
    gistTags.classList.add( 'tags' );
    gistLangs.classList.add( 'langs' );

    let info = gist.description;
    let title = info;
    let desc = '';
    let tags = [];
    let files = gist.files;

    // Check if using CodeExpander format: |-|{META DATA}
    if( info.includes( '|-|' ) ) {
        let metaStart = info.indexOf( '|-|' );
        info = info.substr( 0, metaStart - 2 );
    }

    // Check if using CodeExpander title format: [TITLE] DESC #TAG #TAG
    if( info.includes( '[' ) && info.includes( ']' ) ) {
        let titleStart = info.indexOf( '[' ) + 1;
        let titleEnd = info.indexOf( ']' );
        title = info.substr( titleStart, titleEnd - titleStart );
        desc = info.slice( titleEnd + 1 );

        // Check for #tags
        while( desc.includes( '#' ) ) {
            let tagStart = desc.lastIndexOf( '#' ) + 1;
            let tag = desc.slice( tagStart );
            tags.push( tag );
            desc = desc.substr( 0, tagStart - 2 );
        }
    }

    gistHeading.textContent = title;
    gistDesc.textContent = desc;

    tags.forEach( tag => {
        let gistTag = document.createElement( 'li' );
        gistTags.appendChild( gistTag );
        gistTag.textContent = tag;
    } );

    let langs = [];

    Object.keys( files ).forEach( file => {
        let lang = files[file].language.toLowerCase();
        let gistFile = document.createElement( 'li' );
        gistFiles.appendChild( gistFile );
        gistFile.classList.add( lang );
        gistFile.textContent = files[file].filename;
        if( !langs.includes( lang ) ) langs.push( lang );
    } );

    langs.forEach( lang => {
        let gistLang = document.createElement( 'li' );
        gistLangs.appendChild( gistLang );
        gistLang.textContent = lang;
    } );

}


