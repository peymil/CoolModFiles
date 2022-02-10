
<script>
    import Player from '$components/Player.svelte';
    import { getRandomNumber } from '../utils';
    export let maxId;
    export let genres;
</script>

<script lang="ts" context="module">
    import type { Load } from '@sveltejs/kit';

    // these functions needs domparser to run
    // const playByGenre = async (genreId) => {
    //     const { parseFromString } = new DOMParser();
    //     const resFirstPage = await fetch(
    //         `https://modarchive.org/index.php?query=${genreId}&request=search&search_type=genre`,
    //     );
    //     const firstPageDoc = parseFromString(await resFirstPage.text(), 'text/html');
    //     const optionList = firstPageDoc.querySelectorAll('form > p > select');
    //     // Page numbers starting with 1
    //     const lastPageNumber = parseInt(optionList[optionList.length - 1].textContent);
    //     const randomPageNumber = Math.floor(Math.random() * lastPageNumber) + 1;
    //     let docToQuery;
    //     if (randomPageNumber === 1) {
    //         docToQuery = firstPageDoc;
    //     } else {
    //         const res = await fetch(
    //             `https://modarchive.org/index.php?query=${genreId}&request=search&search_type=genre&page=${randomPageNumber}`,
    //         );
    //         docToQuery = parseFromString(await res.text(), 'text/html');
    //     }
    //     const links = docToQuery.querySelectorAll('table > tbody > tr > td > a[title="Play"]');
    //     const randomPageNum = getRandomNumber(links.length);
    //     return links[randomPageNum].href.match(/'\?([0-9]*)'/g);
    // };
    // const getGenres = async () => {
    //     const parser = new document.DOMP();
    //     const res = await fetch(`https://modarchive.org/index.php?request=view_genres`);
    //     const doc = parser.parseFromString(await res.text(), 'text/html');
    //     const aDocs = doc.querySelectorAll('table > tbody > tr> td > ul > li > a');
    //     console.log(aDocs.length);
    //     const genreIdExtractor = new RegExp('query=([0-9]*)');
    //     let genreIds = [];
    //     for (let aDoc of aDocs) {
    //         const matches = genreIdExtractor.exec(aDoc.href);
    //         if (matches) genreIds.push(matches[1]);
    //     }
    //     return genreIds;
    // };

    export const load: Load = async ({ fetch }) => {
        // const genres = getGenres()
        try {
            const rss_req = await fetch('https://modarchive.org/rss.php?request=uploads', {
                method: 'GET',
            });
            const rss = await rss_req.text();
            const maxId = parseInt(rss.split('downloads.php?moduleid=')[1].split('#')[0]);
            return { props: { maxId } };
        } catch (err) {
            return { props: { maxId: 22 } };
        }
    };
</script>



<svelte:head>
    <title>CoolModFiles.com - Play some cool MOD files!</title>
</svelte:head>

<section class="w-full h-screen flex justify-center items-start p-3 md:items-center">
    <Player {maxId} />
</section>
