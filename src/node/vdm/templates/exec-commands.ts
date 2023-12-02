export function execCommands(index: number, tick: number, commands: string) {
  return `
  "${index}"
    {
      factory "PlayCommands"
		  name "PlayCommands${index}"
		  starttick "${tick}"
		  commands "${commands}"
    }`;
}
