import { get, writable,readable,derived } from 'svelte/store';
import type { Writable,Readable } from 'svelte/store';

class PlayerStore {
    id: Writable<string> = writable("")
    // idHistory: Writable<string[]> =derived(this.id,$id => [...$idHistory,this.id])
    volume: Writable<number> = writable(0);
    playerInstance: ChiptuneJsPlayer;
    buffer: AudioBuffer;
    loading: Writable<boolean> = writable(true);
    isPlaying: Writable<boolean> = writable(false);
    metaData: Writable<ReturnType<ChiptuneJsPlayer['metadata']>> = writable(null);
    position: Writable<number[]> = writable([0],(set) => {
        let positionInterval;
        this.isPlaying.subscribe((isPlaying) => {
            if (isPlaying && !positionInterval) {
                positionInterval = setInterval(() => {
                    const newPosition = this.playerInstance.getPosition();
                    set([newPosition]);
                    if (newPosition === 0) {
                        clearInterval(positionInterval);
                    }
                }, 300);
            } else {
                console.log("clear");
                
                clearInterval(positionInterval);
            }
        });
        return () => clearInterval(positionInterval);

    });
    prettifiedPosition = derived(this.position, $position => {
        const minutes = Math.floor($position[0] / 60).toString().padStart(2,"0")
        const seconds = Math.floor($position[0] % 60).toString().padStart(2,"0")
        return `${minutes}:${seconds}`
    })
    duration: Writable<number> = writable(0);
    prettifiedDuration = derived(this.duration, $duration => {
        const minutes = Math.floor($duration / 60).toString().padStart(2,"0")
        const seconds = Math.floor($duration % 60).toString().padStart(2,"0")
        return `${minutes}:${seconds}`
    })
    setup(volume = 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.playerInstance = new ChiptuneJsPlayer(new ChiptuneJsConfig(0, volume));
        console.log('[player] player initialized');
    }
    async load(idToLoad: string) {
        this.loading.set(true);
        this.buffer = await this.playerInstance.load(`jsplayer.php?moduleid=${idToLoad}`);
        this.playerInstance.play(this.buffer);
        this.metaData.set(this.playerInstance.metadata());
        this.duration.set(this.playerInstance.duration());
        this.id.set(idToLoad)
        this.loading.set(false);

        console.log('[player] buffer loaded, id:', idToLoad);
    }
    seek(value: number) {
        this.playerInstance.seek(value);
        this.position.set([value])
    }

    setVolume(volume: number) {
        this.volume.set(volume);
        this.playerInstance.setVolume(volume);
    }
    play() {
        this.isPlaying.set(true);
        // this.playerInstance.play();
        console.log('[player] Player start');
    }

    togglePause() {
        this.playerInstance.togglePause();
        this.isPlaying.set(!get(this.isPlaying));
        console.log(`[player] Player ${get(this.isPlaying) ? 'resume' : 'pause'}`);
    }

    stop() {
        this.playerInstance.stop();
        this.isPlaying.set(false);
        console.log('[player] Player stop');
    }
    getPosition() {
        return this.playerInstance.getPosition();
    }
}

export default new PlayerStore();
