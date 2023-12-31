import { PasswordGeneratorContextProvider } from './components/PasswordGenerator/PasswordGeneratorContext';
import { ItemEffects } from './context/items/ItemEffects';
import { ItemsFilteringContextProvider } from './context/items/ItemsFilteringContext';
import { NavigationContextProvider } from './context/navigation/NavigationContext';
import { Main } from './views/Main';

export const App = () => {
    return (
        <NavigationContextProvider>
            <ItemsFilteringContextProvider>
                <ItemEffects />
                <PasswordGeneratorContextProvider>
                    <Main />
                </PasswordGeneratorContextProvider>
            </ItemsFilteringContextProvider>
        </NavigationContextProvider>
    );
};
