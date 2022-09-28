const caja = document.getElementById('caja');
const loader = document.querySelector('.pokeballs-container');
const baseURL = 'https://pokeapi.co/api/v2/pokemon/';

let isFetching = false;
const nextURL = {
	next: null,
};

const renderPokemon = (pokemon) => {
	const { id, name, sprites, height, weight, types } = pokemon;
	return `
    <div class="poke">
      <img src="${sprites.other.home.front_default}" alt="${name}" />
      <h2>${name.toUpperCase()}</h2>
      <span class="exp">EXP: ${pokemon.base_experience}}</span>
      <div class="tipo-poke">
        ${types.map((tipo) => {
					return `<span class="${tipo.type.name} poke__type">${tipo.type.name}</span>`;
				})}
      </div>
      <p class="id-poke">#${id}</p>
      <p class="height">Height: ${height / 10}m</p>
      <p class="weight">Weight: ${weight / 10}Kg</p>
    </div>
    `;
};

const renderPokemonList = (pokeList) => {
	const cards = pokeList
		.map((pokemon) => {
			return renderPokemon(pokemon);
		})
		.join('');
	caja.innerHTML += cards;
};

const fetchPokemons = async () => {
	const res = await fetch(`${baseURL}?limit=8&offset=0`);
	const data = await res.json();
	return data;
};

const loadAndPrint = (pokemonList) => {
	loader.classList.add('show');
	setTimeout(() => {
		loader.classList.remove('show');
		renderPokemonList(pokemonList);
		isFetching = false;
	}, 1000);
};

const init = () => {
	window.addEventListener('DOMContentLoaded', async () => {
		let { next, results } = await fetchPokemons();
		nextURL.next = next;
		const URLS = results.map((pokemon) => pokemon.url);
		const infoPokemones = await Promise.all(
			URLS.map(async (url) => {
				const nextPokemons = await fetch(url);
				return await nextPokemons.json();
			})
		);
		renderPokemonList(infoPokemones);
	});

	window.addEventListener('scroll', async () => {
		const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
		const bottom = scrollTop + clientHeight >= scrollHeight - 1;
		if (bottom && !isFetching) {
			isFetching = true;
			const nextPokemons = await fetch(nextURL.next);
			const { next, results } = await nextPokemons.json();
			nextURL.next = next;

			const URLS = results.map((pokemon) => pokemon.url);

			const infoPokemons = await Promise.all(
				URLS.map(async (url) => {
					const nextPokemons = await fetch(url);
					return await nextPokemons.json();
				})
			);

			loadAndPrint(infoPokemons);
		}
	});
};

init();
