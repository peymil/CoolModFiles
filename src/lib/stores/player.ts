import { get, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

class PlayerStore {
    volume: Writable<number[]> = writable([0]);
    playerInstance: ChiptuneJsPlayer;
    buffer: AudioBuffer;
    loading: Writable<boolean> = writable(true);
    isPlaying: Writable<boolean> = writable(false);
    metaData: Writable<ReturnType<ChiptuneJsPlayer['metadata']>> = writable(null);
    position: Writable<number[]> = writable([0]);
    duration: Writable<number> = writable(0)
    setup() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.playerInstance = new ChiptuneJsPlayer(new ChiptuneJsConfig(0, this.volume[0]));
        console.log('[player] player initialized');
        
    }

    private initializeDurationWatch() {
        console.log("this",this);
        
        let positionInterval
        this.isPlaying.subscribe((isPlaying) => {
            if (isPlaying || !positionInterval) {
                positionInterval = setInterval(() => {
                    const newPosition = this.playerInstance.getPosition();
                    this.position.set([newPosition]);
                    console.log("newPOsition",newPosition);
                    
                    if (newPosition === 0) {
                        clearInterval(positionInterval);
                    }
                }, 300);
            } else {
                clearInterval(positionInterval);
            }
        });
    }

    async load(id: string) {
        this.buffer = await this.playerInstance.load(`jsplayer.php?moduleid=${id}`);
        this.loading.set(false);
        console.log('[player] buffer loaded, id:', id);
    }

    seek(value: number) {
        console.log("seek",this);
        
        // this.position.set([value])
        return this.playerInstance.seek(value);
    }

    setVolume(volume:number){
        this.volume.set([volume])
        this.playerInstance.setVolume(volume)
    }
    play() {
        this.playerInstance.play(this.buffer);
        this.metaData.set(this.playerInstance.metadata());
        this.duration.set(this.playerInstance.duration())
        this.initializeDurationWatch()
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
