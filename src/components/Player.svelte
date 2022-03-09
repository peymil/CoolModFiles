<script lang="ts">
    import Slider from 'svelte-range-slider-pips';
    import PlayerStore from '$lib/stores/player';
    import { onMount } from 'svelte';
    import VoiceButton from './VoiceButton.svelte';
    import Playlist from './History.svelte';
    import { get, writable } from 'svelte/store';

    const {
        loading,
        isPlaying,
        metaData,
        volume,
        duration,
        position,
        id,
        prettifiedDuration,
        prettifiedPosition,
        songHistory,
        songHistoryPos,
    } = PlayerStore;
    function loadFromPlaylist(idToLoad: string) {
        const _songHistory = get(songHistory);
        let i = 0;
        for (const { id: _id } of _songHistory) {
            console.log(_id);
            if (_id === idToLoad) {
                PlayerStore.load(idToLoad);
                songHistoryPos.set(i);
                return;
            }
            i++;
        }
    }
    let positionInsideArray: number[] = [0];
    let historyVisible = writable(false);
    // let initalStart = true;
    position.subscribe((newPos) => (positionInsideArray[0] = newPos));

    onMount(async () => {
        PlayerStore.setup($$props.maxId);
        await PlayerStore.next();
    });
    $: console.log('isPlaying', $position);
</script>

<!-- {#if $loading}
    <h1>Loading...</h1>
    {:else if initalStart}
    <button
        on:click={() => {
            PlayerStore.play();
            initalStart = false;
        }}>Play song</button
    >
{:else} -->
<div class="player relative p-5 md:w-7/12 lg:w-5/12 xl:w-1/4 2xl:w-1/5">
    <div class="relative z-50 ">
        <div class="flex relative flex-col items-center z-50">
            <button class="absolute right-0">Share</button>
            <div class="absolute left-0 flex flex-col h-40">
                <button>Download</button>
                <button
                    on:click={() => {
                        historyVisible.update((prev) => !prev);
                    }}>Playlist</button
                >
                <button>Favorite</button>
            </div>
            <img
                class="w-24"
                alt="player animation gif"
                src={$isPlaying ? 'images/disc_anim.gif' : 'images/disc_idle.gif'}
            />
            <h3>{$loading ? 'Loading...' : $metaData.title.toUpperCase()}</h3>
            <div class="description w-full overflow-y-auto overflow-x-hidden h-52">
                <div>Type: {$loading ? 'Loading...' : $metaData.type}</div>
                <div>Track Id: {$loading ? 'Loading...' : $id}</div>
                <div>Message: {$loading ? 'Loading...' : $metaData.message}</div>
            </div>
        </div>

        <Slider
            range="min"
            min={0}
            max={$duration}
            springValues={{ stiffness: 1, damping: 1 }}
            bind:values={positionInsideArray}
            on:change={({ detail: { value } }) => PlayerStore.seek(value)}
        />
        <div class="flex justify-between text-xs">
            <span>{$prettifiedPosition}</span>
            <span>{$prettifiedDuration}</span>
        </div>
        <div class="flex flex-row w-full justify-evenly">
            <button on:click={() => PlayerStore.previous()}>Prev</button>
            <button on:click={() => PlayerStore.togglePause()}
                >{$isPlaying ? 'Pause' : 'Play'}</button
            >
            <button on:click={() => PlayerStore.next()}>Next</button>
            <VoiceButton onVolumeChange={(vol) => PlayerStore.setVolume(vol)} {volume} />
        </div>
        <div class="flex flex-row justify-between bottom">
            <button>Help</button>
            <div>
                <button>Favorite</button>
                <button>Loop</button>
            </div>
        </div>
    </div>
    <Playlist
        {songHistory}
        currentSongId={$id}
        visible={historyVisible}
        onClick={(songId) => {
            loadFromPlaylist(songId);
        }}
    />
</div>

<!-- {/if} -->
<style lang="scss">
    .player {
        @apply bg-black text-white;
        box-shadow: 5px 5px 10px 3px rgba(0, 0, 0, 0.75);
        &__gif {
            width: 3em;
        }
    }

    .description {
        color: #8e8e8e;
        scrollbar-color: #bd00ff transparent;
        scrollbar-width: thin;
    }
</style>
