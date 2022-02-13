import { get, writable, readable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import { getRandomNumber } from '../../utils';
type MinimalSongDetails = {
    id: string;
    title: string;
};
class PlayerStore {
    id: Writable<string> = writable('');
    maxId: number;
    songHistory: Writable<MinimalSongDetails[]> = writable([]);
    songHistoryPos: Writable<number> = writable(0);
    volume: Writable<number> = writable(0);
    playerInstance: ChiptuneJsPlayer;
    buffer: AudioBuffer;
    loading: Writable<boolean> = writable(true);
    isPlaying: Writable<boolean> = writable(false);
    metaData: Writable<ReturnType<ChiptuneJsPlayer['metadata']>> = writable(null);
    position: Writable<number[]> = writable([0], (set) => {
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
                clearInterval(positionInterval);
            }
        });
        return () => clearInterval(positionInterval);
    });
    prettifiedPosition = derived(this.position, ($position) => {
        const minutes = Math.floor($position[0] / 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor($position[0] % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    });
    duration: Writable<number> = writable(0);
    prettifiedDuration = derived(this.duration, ($duration) => {
        const minutes = Math.floor($duration / 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor($duration % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    });
    constructor(maxId: number) {
        this.maxId = maxId;
    }
    setup(volume = 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.playerInstance = new ChiptuneJsPlayer(new ChiptuneJsConfig(0, volume));
        console.log('[player] player initialized');
    }

    private async loadRandomMod() {
        try {
            const randomModId = getRandomNumber(this.maxId + 1).toString();
            await this.load(randomModId);
        } catch (err) {
            console.log('not found');
            await this.loadRandomMod();
        }
    }

    async load(idToLoad: string) {
        this.loading.set(true);
        this.buffer = await this.playerInstance.load(`jsplayer.php?moduleid=${idToLoad}`);
        this.playerInstance.play(this.buffer);
        this.metaData.set(this.playerInstance.metadata());
        this.duration.set(this.playerInstance.duration());
        this.id.set(idToLoad);
        this.loading.set(false);
        this.isPlaying.set(true);
        console.log('[player] buffer loaded, id:', idToLoad);
    }

    /**
     * Load previously played song. If there is no previous song do nothing.
     */
    previous() {
        const songHistoryPos = get(this.songHistoryPos);
        if (songHistoryPos > 0) {
            const songHistory = get(this.songHistory);
            const prevId = songHistory[songHistoryPos].id;
            this.load(prevId);
        }
    }

    /**
     * Load random song or song that loaded before previous() called.
     */
    async next() {
        const songHistoryPos = get(this.songHistoryPos);
        const songHistory = get(this.songHistory);
        if (songHistory.length - 1 <= songHistoryPos) {
            await this.loadRandomMod();
            this.songHistory.update((prevSongHistory) => [
                ...prevSongHistory,
                { id: get(this.id), title: this.playerInstance.metadata().title },
            ]);
        } else {
            const _songHistory = get(this.songHistory);
            const nextId = _songHistory[songHistoryPos].id;
            this.songHistoryPos.update((prev) => prev + 1)
            await this.load(nextId);
        }

    }

    /**
     * Unload song. Seems useless :/
     */
    unload() {
        this.playerInstance.stop();
        this.isPlaying.set(false);
    }

    /**
     * Set player's position.
     * @param newPosition In seconds
     */
    seek(newPosition: number) {
        this.playerInstance.seek(newPosition);
        this.position.set([newPosition]);
    }

    /**
     * Set volume of the player.
     * Currently it is not muting completely
     * @param volume between 0-100
     */
    setVolume(volume: number) {
        this.volume.set(volume);
        this.playerInstance.setVolume(volume);
    }

    togglePause() {
        this.playerInstance.togglePause();
        this.isPlaying.set(!get(this.isPlaying));
        console.log(`[player] Player ${get(this.isPlaying) ? 'resume' : 'pause'}`);
    }

    pause() {
        this.isPlaying.set(false);
        this.playerInstance.pause();
    }

    unpause() {
        this.isPlaying.set(false);
        this.playerInstance.unpause();
    }
}

export default PlayerStore;
