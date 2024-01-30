import { Header, Menu, MenuItem, ContextMenu } from '../components';

export function Arrange() {
	const menu = (
		<Menu>
			<MenuItem>item 1</MenuItem>
			<MenuItem>item 2</MenuItem>
			<MenuItem>
				item 3
				<Menu isFlyout>
					<MenuItem>item 3 - 1</MenuItem>
					<MenuItem>item 3 - 2</MenuItem>
				</Menu>
			</MenuItem>
			<MenuItem>item 4</MenuItem>
			<MenuItem>
				item 5
				<Menu isFlyout>
					<MenuItem>
						item 5 - 1
						<Menu isFlyout>
							<MenuItem>item 5 - 1 - 2</MenuItem>
							<MenuItem>item 5 - 1 - 3</MenuItem>
						</Menu>
					</MenuItem>
					<MenuItem>
						item 5 - 2
					</MenuItem>
				</Menu>
			</MenuItem>
		</Menu>
	);

	return (
		<>
			<Header />
			<main>
				<ContextMenu menu={menu}>
					<span>
						Arrange
					</span>
				</ContextMenu>
			</main>
		</>
	);
}
