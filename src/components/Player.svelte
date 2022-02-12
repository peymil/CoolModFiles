<script lang="ts">
    import Slider from 'svelte-range-slider-pips';
    import PlayerStore from '$lib/stores/player';
    import { onMount } from 'svelte';
    import { getRandomNumber } from '../utils';
import VoiceButton from './VoiceButton.svelte';
import player from '$lib/stores/player';

    const { loading, isPlaying, metaData, volume, duration, position, id, prettifiedDuration,prettifiedPosition } =
        PlayerStore;

    let initalStart = true;
    const getRandomModId = () => getRandomNumber($$props.maxId + 1).toString();
    const loadAndPlayNewMod = async () => {
        try {
            PlayerStore.stop();
            await PlayerStore.load(getRandomModId());
        } catch (err) {
            console.log('not found');
            loadAndPlayNewMod();
        }
    };
    onMount(async () => {
        PlayerStore.setup();
        await loadAndPlayNewMod()
    });
    $: console.log($position)
    $: console.log($isPlaying)
</script>

{#if $loading}
    <h1>Loading...</h1>
    <!-- {:else if initalStart}
    <button
        on:click={() => {
            PlayerStore.play();
            initalStart = false;
        }}>Play song</button
    > -->
{:else}
    <div class="player justify-self-center flex md:w-7/12 lg:w-5/12 xl:w-1/4 2xl:w-1/5 opacity-95">
        <div class="p-4 items-center w-full">
            <div class="flex relative flex-col items-center">
                <button class="absolute right-0">Share</button>
                <div class="absolute left-0 flex flex-col h-40">
                    <button>Download</button>
                    <button>Favorite</button>
                </div>
                <img
                    class="w-24"
                    alt="player animation gif"
                    src={$isPlaying ? 'images/disc_anim.gif' : 'images/disc_idle.gif'}
                />
                <h3>{$metaData.title.toUpperCase()}</h3>
                <div class="description w-full overflow-y-auto overflow-x-hidden h-52">
                    <div>Type: {$metaData.type}</div>
                    <div>Track Id: {$id}</div>
                    <div>Message: {$metaData.message}</div>
                </div>
            </div>

            <Slider
                range="min"
                min={0}
                max={$duration}
                springValues={{ stiffness: 1, damping: 1 }}
                bind:values={$position}
                on:change={({ detail: { value } }) => PlayerStore.seek(value)}
            />
            <div class="flex justify-between text-xs">
                <span>{$prettifiedPosition}</span>
                <span>{$prettifiedDuration}</span>
            </div>
            <div class="flex flex-row w-full justify-around">
                <button on:click={() => PlayerStore.togglePause()}>Prev</button>
                <button on:click={() => PlayerStore.togglePause()}
                    >{$isPlaying ? 'Pause' : 'Play'}</button
                >
                <button on:click={loadAndPlayNewMod}>Next</button>
                <VoiceButton onVolumeChange={PlayerStore.setVolume} volume={volume}/>
            </div>
            <div class="flex flex-row justify-between bottom">
                <button>Help</button>
                <div>
                    <button>Favorite</button>
                    <button>Loop</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .player {
        @apply p-3 bg-black text-white;
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
