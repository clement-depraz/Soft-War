import './main.scss'
import {default as $} from 'jquery'
import {SoftwarAPI, GameInfo} from 'softwar-lib-client'

const routerUrl = {host: 'softwar-server', port: 4242}
const publisherUrl = {host: 'softwar-server', port: 4243}

$(() => {
	const $canvas = $('#game_canvas')
	const $networkStatus = $('#game_network_status')
	const $players = $('#game_player_status')
	$networkStatus.text('Socket.io connecting...')

	const api = new SoftwarAPI()
	api.onConnect.add(async () => {
		$canvas.text('Socket.io connected')
		await api.subscribePublisher(publisherUrl)
		await api.subscribeRouter(routerUrl)
		console.log('succesfully joined game server')
		$networkStatus.html('Connected with game server <b>tcp://localhost:4243</b>')
	})

	api.onNotification.add(notification => {
		const date = (new Date()).toString()
		const datestr = date.split(' GMT')[0]
		console.log(`[${datestr}] notification:`, notification)
		$canvas.text('').append(
			$('<span>').text(`Last notification - last updated ${datestr}:`),
			$('<pre>').text('notification: ' + JSON.stringify(notification, null, 4))
		)
	})

	api.onCycle.add(gameInfo => {
		if (gameInfo.players.length)
			$players.empty().append(...gameInfo.players.map(player =>
				$('<pre>').text(JSON.stringify(player))
			))
		else
			$players.text('Lobby is empty')
	})

	api.onDisconnect.add(() => {
		$networkStatus.text('Socket.io disconnected')
	})

	api.connect()

	const sleep = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout))
	const nextCycle = (api: SoftwarAPI) => new Promise<GameInfo>((resolve) => api.onCycle.add(resolve, true))
	const bravely = async <TRet>(p: Promise<TRet>, defaultValue: TRet) => {
		try {return await p}
		catch (e) {return defaultValue}
	}

	const startIA = async () => {
		if (players.length >= 4)
			return console.warn('already has 4 IA')
		const player = new SoftwarAPI()

		players.push(player)

		player.connect()
		await player.subscribePublisher(publisherUrl)
		await player.subscribeRouter(routerUrl)
		const identity = await player.identify()

		let cycleInfo: GameInfo
		while (cycleInfo = await player.nextCycle()) {
			await bravely(player.turnRight())
			await bravely(player.attack())
			await bravely(player.jumpForward())
		}
	}

	const players: Array<SoftwarAPI> = []
	const $addAIButton = $('#game_add_ai').click(() => {
		startIA()
		$addAIButton.text('Add a sample AI (' + (4 - players.length) + ' remaining)')
		if (players.length >= 4) {
			$addAIButton.remove()
			$addAISButton.remove()
		}
	})
	const $addAISButton = $('#game_add_ais').click(() => {
		for (let i = players.length; i < 4; i++)
			$addAIButton.click()
	})

	; (window as any).api = api
	; (window as any).players = players
})
