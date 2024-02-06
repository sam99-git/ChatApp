export class Helpers{
	static firstLetterUpperCase( str: string ): string{
		const valueSting = str.toLowerCase();
		return valueSting
			.split( ' ' )
			.map((value : string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
			.join( ' ' );
	}

	static lowerCase( str: string ): string{
		return str.toLowerCase();
	}
	static generateRandomIntegers(integerLength: number): number{
		const characters = '0123456789';
		let result = '';
		const charactersLenght = characters.length;
		for (let i = 0 ; i < integerLength; i++){
			result += characters.charAt(Math.floor(Math.random() * charactersLenght));
		}
		return parseInt(result , 10);
	}

	static parseJson(prop: string): any {
		try{
			JSON.parse(prop);
		}catch(error){
			return prop;
		}
	}
}
