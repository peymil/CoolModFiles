<script lang="ts">
    import Slider from 'svelte-range-slider-pips';
    export let volume;
    export let onVolumeChange;
    let isVolumeButtonPressed = false;
</script>

<div class="relative">
    <div on:click={() => isVolumeButtonPressed = !isVolumeButtonPressed}>
        {$volume ? "Volume" : 'X'}
    </div>
    {#if isVolumeButtonPressed}
        <div class="absolute bottom-full w-full flex justify-center z-10">
            <div class="bg-black">
            <Slider
                vertical
                range="min"
                min={0}
                max={100}
                springValues={{ stiffness: 1, damping: 1 }}
                bind:values={$volume}
                on:change={({ detail: { value } }) => onVolumeChange(value)}
            />
        </div>
        </div>
    {/if}
</div>
