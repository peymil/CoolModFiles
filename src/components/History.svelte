<script lang="ts">
    import { writable } from 'svelte/store';
    import type { Writable } from 'svelte/store';
    import type PlayerStore from '../lib/stores/player';
    export let songHistory: typeof PlayerStore['songHistory'];
    export let currentSongId: string;
    export let onClick: (songId: string) => void;
    export let visible: Writable<boolean>;
    let isAnimationEnded = writable(false);
    visible.subscribe((isVisible) => {
        isAnimationEnded.set(false)
        if (!isVisible) {
            setTimeout(() => {
                isAnimationEnded.set(true);
            }, 1 * 1000);
        }
    });
    $: console.log("isAnimationEnded",$isAnimationEnded);
    $: console.log("visible",$visible);

    // visible.subscribe((isVisible) => if(isVisible) set);
</script>

{#if $visible || !$isAnimationEnded}
    <div
        class={`history p-3 bg-black text-white absolute w-full h-full flex flex-col z-10 top-0 left-0 px-2 ${
            $visible ? 'slider-right' : 'slider-left'
        }`}
    >
        <h2 class="self-center bm-10">History</h2>
        <table id="historyScroll" class="overflow-y-auto overflow-x-hidden flex flex-col z-10">
            {#each $songHistory as item}
                <button
                    class={`song w-auto  py-0.5 z-10 whitespace-nowrap text-xs ${
                        item.id === currentSongId ? 'songPlaying' : ''
                    }`}
                    on:click={(e) => {
                        onClick(item.id);
                        const element = e.currentTarget.parentElement;
                        element.scrollTo(0, e.currentTarget.scrollHeight);
                    }}
                >
                    <td class="max-w-10 pr-5 ">{item.id}</td>
                    <td class=""> {item.title || 'Untitled'}</td>
                </button>
            {/each}
        </table>
    </div>
{/if}

<style type="scss">
    .history {
        @apply p-3 bg-black text-white;
    }
    @keyframes slide-right {
        0% {
            left: 0%;
        }
        100% {
            left: 100%;
        }
    }
    @keyframes slide-left {
        0% {
            left: 100%;
        }
        100% {
            left: 0%;
        }
    }
    .songPlaying {
        background-color: #bd00ff;
    }
    .song:hover {
        background-color: wheat;
    }
    .slider-right {
        animation: slide-right 1s forwards;
    }
    .slider-left {
        animation: slide-left 1s forwards;
    }
</style>
