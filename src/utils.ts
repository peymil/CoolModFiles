type randomNumber = [number, number] | [number];
export const getRandomNumber = (...parameters: randomNumber) => {
    const [min, max] = parameters[1] ? parameters : [0, parameters[0]];
    return Math.floor(Math.random() * max + min);
};