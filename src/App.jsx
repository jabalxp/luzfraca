import { useUI } from './store/ui.js';
import IntroScreen from './screens/IntroScreen.jsx';
import MenuScreen from './screens/MenuScreen.jsx';
import PlayScreen from './screens/PlayScreen.jsx';
import PrepScreen from './screens/PrepScreen.jsx';
import LoreScreen from './screens/LoreScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import ShopScreen from './screens/ShopScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';

export default function App() {
  const screen = useUI(s => s.screen);
  return (
    <div className="h-full w-full bg-void">
      {screen === 'intro' && <IntroScreen />}
      {screen === 'menu' && <MenuScreen />}
      {screen === 'play' && <PlayScreen />}
      {screen === 'prep' && <PrepScreen />}
      {screen === 'lore' && <LoreScreen />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'shop' && <ShopScreen />}
      {screen === 'game' && <GameScreen />}
    </div>
  );
}
