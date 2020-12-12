import React from 'react';
import { Icon, Input, Mark } from 'react-components';
import iconSvg from 'design-system/_includes/sprite-icons.svg';

export default { component: Icon, title: 'Proton UI / Icons' };

export const PrimaryIcons = () => {
    const primaryIconNames: string[] = iconSvg
        .match(/id="shape-([^"]+)/g)
        .map((x: string) => x.replace('id="shape-', ''));
    const [search, setSearch] = React.useState('');
    const iconResults = React.useMemo(() => {
        if (search.length <= 1) {
            return primaryIconNames;
        }
        return primaryIconNames.filter((x) => x.toLowerCase().includes(search.toLocaleLowerCase()));
    }, [search]);
    return (
        <div>
            <Input placeholder="Name..." value={search} onChange={({ target: { value } }) => setSearch(value)} />
            <div className="flex mb2">
                {iconResults.map((iconName: string) => (
                    <div className="w200p aligncenter p1">
                        <Icon name={iconName} size={24} />
                        <code className="bl mt0-5">
                            <Mark value={search}>{iconName}</Mark>
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
};
