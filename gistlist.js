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
        document.getElementById( 'username' ).href = userURL;
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

    let gistHeading = document.createElement( 'h3' );
    gistDiv.appendChild( gistHeading );

    let gistDesc = document.createElement( 'p' );
    gistDiv.appendChild( gistDesc );

    let gistFiles = document.createElement( 'ul' );
    gistDiv.appendChild( gistFiles );
    gistFiles.classList.add( 'files' );

    let gistTags = document.createElement( 'ul' );
    gistDiv.appendChild( gistTags );
    gistTags.classList.add( 'tags' );

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
            let tagStart = desc.lastIndexOf( '#' );
            let tag = desc.slice( tagStart );
            tags.push( tag );
            desc = desc.substr( 0, tagStart - 1 );
        }
    }

    gistHeading.textContent = title;
    gistDesc.textContent = desc;

    tags.forEach( tag => {
        let gistTag = document.createElement( 'li' );
        gistTags.appendChild( gistTag );
        gistTag.textContent = tag;
    } );

    Object.keys( files ).forEach( file => {
        let gistFile = document.createElement( 'li' );
        gistFiles.appendChild( gistFile );
        gistFile.classList.add( files[file].language.toLowerCase() );
        gistFile.textContent = files[file].filename;
    } );

}


