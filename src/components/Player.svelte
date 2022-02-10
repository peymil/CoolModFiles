<script lang="ts">
    import Slider from 'svelte-range-slider-pips';
    import PlayerStore from '$lib/stores/player';
    import { onMount } from 'svelte';
    import { getRandomNumber } from '../utils';

    const { loading, isPlaying, metaData, volume, duration, position, id } = PlayerStore;

    let initalStart = true;
    const getRandomModId = () => getRandomNumber($$props.maxId + 1).toString();
    const loadAndPlayNewMod = async () => {
        try {
            PlayerStore.stop();
            await PlayerStore.load(getRandomModId());
            PlayerStore.play();
        } catch (err) {
            console.log('not found');
            loadAndPlayNewMod();
        }
    };
    onMount(async () => {
        PlayerStore.setup();
        await PlayerStore.load(getRandomModId());
    });
</script>

{#if $loading}
    <h1>Loading...</h1>
{:else if initalStart}
    <button
        on:click={() => {
            PlayerStore.play();
            initalStart = false;
        }}>Play song</button
    >
{:else}
    <div class="player w-full h-full md:w-5/6 md:h-3/6 lg:w-7/12 lg:h-3/6">
        <div class="flex flex-col items-center">
            <img alt="player animation gif" src="images/disc_anim.gif" class="player__gif" />
            <div class="flex-1">
                <h3>{$metaData.title.toUpperCase()}</h3>
                <!-- #8e8e8e -->

                <div class="scroll-smooth overflow-visible">
                    <p>Type:{$metaData.type}</p>
                    <p>Track Id:{$id}</p>
                    <p>Message:{$metaData.message}</p>
                </div>
            </div>
            <Slider
                vertical
                range="min"
                min={0}
                max={100}
                springValues={{ stiffness: 1, damping: 1 }}
                bind:values={$volume}
                on:change={({ detail: { value } }) => PlayerStore.setVolume(value)}
            />
        </div>

        <Slider
            range="min"
            min={0}
            max={$duration}
            springValues={{ stiffness: 1, damping: 1 }}
            bind:values={$position}
            on:change={({ detail: { value } }) => PlayerStore.seek(value)}
        />
        <div class="flex flex-row w-full justify-around">
            <button on:click={() => PlayerStore.togglePause()}
                >{$isPlaying ? 'Pause' : 'Play'}</button
            >
            <button on:click={loadAndPlayNewMod}>Next</button>
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
</style>
