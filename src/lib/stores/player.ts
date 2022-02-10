import { get, writable,readable } from 'svelte/store';
import type { Writable,Readable } from 'svelte/store';

class PlayerStore {
    id: Writable<string> = writable("")
    volume: Writable<number[]> = writable([0]);
    playerInstance: ChiptuneJsPlayer;
    buffer: AudioBuffer;
    loading: Writable<boolean> = writable(true);
    isPlaying: Writable<boolean> = writable(false);
    metaData: Writable<ReturnType<ChiptuneJsPlayer['metadata']>> = writable(null);
    position: Writable<number[]> = writable([0]);
    duration: Writable<number> = writable(0);
    setup(volume = 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.playerInstance = new ChiptuneJsPlayer(new ChiptuneJsConfig(0, volume));
        console.log('[player] player initialized');
    }
    private initializeDurationWatch() {
        let positionInterval;
        this.isPlaying.subscribe((isPlaying) => {
            if (isPlaying || !positionInterval) {
                positionInterval = setInterval(() => {
                    const newPosition = this.playerInstance.getPosition();
                    this.position.set([newPosition]);
                    if (newPosition === 0) {
                        clearInterval(positionInterval);
                    }
                }, 300);
            } else {
                clearInterval(positionInterval);
            }
        });
    }

    async load(idToLoad: string) {
        this.loading.set(true);
        this.buffer = await this.playerInstance.load(`jsplayer.php?moduleid=${idToLoad}`);
        this.id.set(idToLoad)
        this.loading.set(false);
        console.log('[player] buffer loaded, id:', idToLoad);
    }

    seek(value: number) {
        // this.position.set([value])
        return this.playerInstance.seek(value);
    }

    setVolume(volume: number) {
        this.volume.set([volume]);
        this.playerInstance.setVolume(volume);
    }
    play() {
        this.playerInstance.play(this.buffer);
        this.metaData.set(this.playerInstance.metadata());
        this.duration.set(this.playerInstance.duration());
        this.initializeDurationWatch();
        this.isPlaying.set(true);
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
