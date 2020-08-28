import React from 'react';
import ReactDOM from 'react-dom'
import {Switch, Menu, Badge, Popover, List, Input, Empty, Button} from 'antd';
import Scrollbar from 'react-scrollbars-custom';
import {observable, autorun} from 'mobx';
import {observer} from 'mobx-react';

import "antd/dist/antd.less";
import '../css/popup.less';

import headerIcon from '../assets/images/magic.png';
import inputIcon from '../assets/images/search.png';
import emptyImage from '../assets/images/magic-hat.png';
import allowIconEnabled from '../assets/images/allow-enabled.png';
import allowIconDisabled from '../assets/images/allow-disabled.png';
import banIconEnabled from '../assets/images/ban-enabled.png';
import banIconDisabled from '../assets/images/ban-disabled.png';

const preventDrag = e => {
    e.preventDefault();
};

const stripOverflow = (txt, max = 24) =>
    txt.length <= max ? txt : txt.slice(0, max) + '...';

const getFaviconUrl = (domain) =>
    'chrome://favicon/size/20px@1x/http://' + domain;

class Header extends React.Component {
    render() {
        return (
            <div className='header'>
                <img src={headerIcon} onDragStart={preventDrag} alt='' className='headerIcon'/>
                <div>
                    <h1 className='headerTitle'>Alora</h1>
                    <h2 className='headerSubTitle'>Protect your online data privacy</h2>
                </div>
            </div>
        );
    }
}

@observer
class MenuBar extends React.Component {
    get allowedTrackersCount() {
        return appState.trackersTabState.listItems.filter(i => !i.isHeader && i.trusted).length;
    }

    render() {
        return (
            <Menu
                mode='horizontal'
                selectedKeys={[appState.activeTabKey]}
                onSelect={e => {
                    appState.activeTabKey = e.key.toString();
                }}
            >
                <Menu.Item key='home'>Home</Menu.Item>
                <Menu.Item key='trackers' disabled={!appState.homeTabState.trackersSwitchState}>
                    <Badge
                        count={this.allowedTrackersCount}
                        showZero={true}
                        style={{display: appState.homeTabState.trackersSwitchState ? 'block' : 'none'}}
                    >Trackers</Badge>
                </Menu.Item>
                <Menu.Item key='manage'>Manage</Menu.Item>
            </Menu>
        );
    }
}

class TagLine extends React.Component {
    render() {
        return (
            <div className='tagline'>
                <Popover placement='bottomLeft' content={<div>{this.props.hint}</div>} trigger='hover'>
                    <div className='tagline-icon'>
                        <span>i</span>
                    </div>
                </Popover>
                <div className='tagline-content'>
                    <span>{this.props.content}</span>
                </div>
            </div>
        );
    }
}

@observer
class DomainDisplay extends React.Component {
    render() {
        return (
            <div className='domain-display'>
                <img src={getFaviconUrl(appState.homeTabState.domain)} onDragStart={preventDrag} alt=''/>
                <span>{stripOverflow(appState.homeTabState.domain)}</span>
            </div>
        );
    }
}

@observer
class ToggleSwitch extends React.Component {
    render() {
        return (
            <Switch checked={this.props.getChecked()} onClick={this.props.onChange}/>
        );
    }
}

@observer
class HomeTab extends React.Component {
    getCookieSwitchState = () => appState.homeTabState.cookieSwitchState;

    getTrackersSwitchState = () => appState.homeTabState.trackersSwitchState;

    toggleCookieSwitchState = () => {
        appState.homeTabState.cookieSwitchState =
            !appState.homeTabState.cookieSwitchState;
    };

    toggleTrackersSwitchState = () => {
        appState.homeTabState.trackersSwitchState =
            !appState.homeTabState.trackersSwitchState;
    };

    render() {
        return (
            <div className='home-tab' style={{
                display: appState.activeTabKey === 'home' ? 'block' : 'none'
            }}>
                <div className='home-tab-box home-tab-box-cookie'>
                    <TagLine content='Never store my browsing history on'
                             hint='By erasing your browsing history, Alora will help you reduce ads and clean the cache and cookies related to this site on your computer.'/>
                    <DomainDisplay/>
                    <ToggleSwitch
                        getChecked={this.getCookieSwitchState}
                        onChange={this.toggleCookieSwitchState}
                    />
                </div>
                <div className='home-tab-box home-tab-box-trackers'>
                    <TagLine content='Blocking trackers on all sites'
                             hint='Alora blocks trackers and other malicious scripts from followling you around online to collect information about your browsing habits and interests.'/>
                    <ToggleSwitch
                        getChecked={this.getTrackersSwitchState}
                        onChange={this.toggleTrackersSwitchState}
                    />
                </div>
            </div>
        );
    }
}

@observer
class SingleTracker extends React.Component {
    render() {
        return (
            <>
                <span>{stripOverflow(this.props.item.content)}</span>
                <div className='single-tracker-action'>
                    <img
                        alt=''
                        onDragStart={preventDrag}
                        src={!this.props.item.trusted ? banIconEnabled : banIconDisabled}
                        style={{cursor: this.props.item.trusted ? 'pointer' : 'default'}}
                        onClick={() => {
                            if (this.props.item.trusted) {
                                this.props.item.trusted = false;
                            }
                        }}
                    />
                    <img
                        alt=''
                        onDragStart={preventDrag}
                        src={this.props.item.trusted ? allowIconEnabled : allowIconDisabled}
                        style={{cursor: !this.props.item.trusted ? 'pointer' : 'default'}}
                        onClick={() => {
                            if (!this.props.item.trusted) {
                                this.props.item.trusted = true;
                            }
                        }}
                    />
                </div>
            </>
        );
    }
}

@observer
class TrackersList extends React.Component {
    render() {
        return (
            <List>
                {appState.trackersTabState.listItems.map(item => {
                    if (item.isHeader) {
                        return (
                            <List.Item>
                                <span className='trackers-list-header'>{stripOverflow(item.content)}</span>
                            </List.Item>
                        );
                    } else {
                        return (
                            <List.Item>
                                <SingleTracker item={item}/>
                            </List.Item>
                        );
                    }
                })}
            </List>
        );
    }
}

@observer
class TrackersTab extends React.Component {
    get isEmpty() {
        return appState.trackersTabState.listItems.length <= 0;
    }

    get allTrusted() {
        return appState.trackersTabState.listItems.every(i => i.isHeader || i.trusted);
    }

    handleClick = () => {
        if (this.allTrusted) {
            appState.trackersTabState.listItems.forEach(i => {
                if (!i.isHeader) {
                    i.trusted = false;
                }
            });
        } else {
            appState.trackersTabState.listItems.forEach(i => {
                if (!i.isHeader) {
                    i.trusted = true;
                }
            });
        }
    };

    render() {
        return (
            <div className='trackers-tab' style={{
                display: appState.activeTabKey === 'trackers' ? 'block' : 'none'
            }}>
                <Empty
                    style={{display: this.isEmpty ? 'block' : 'none'}}
                    image={<img src={emptyImage} onDragStart={preventDrag} alt=''/>}
                    description={<span>There are no trackers on this site!</span>}
                />
                <div
                    className='trackers-list'
                    style={{display: !this.isEmpty ? 'block' : 'none'}}
                >
                    <Scrollbar>
                        <TrackersList/>
                    </Scrollbar>
                    <Button
                        className={
                            this.allTrusted ? 'trust-site-btn-trusted' : ''
                        }
                        onClick={this.handleClick}
                    >
                        {!this.allTrusted ? 'Trust Site' : 'Distrust Site'}
                    </Button>
                </div>
            </div>
        );
    }
}

class InfoSitesList extends React.Component {
    render() {
        return (
            <div className='info-sites-list'>
                <span>You are currently erasing the browsing history from the following site(s):</span>
            </div>
        );
    }
}

class SingleSite extends React.Component {
    render() {
        return (
            <>
                <div className='single-site'>
                    <img src={getFaviconUrl(this.props.domain)} onDragStart={preventDrag} alt=''/>
                    <span>{stripOverflow(this.props.domain)}</span>
                </div>
                <div className='single-site-action'>
                    <a onClick={() => {
                        appState.manageTabState.listItems.remove(this.props.domain);
                    }}>Remove</a>
                </div>
            </>
        );
    }
}

@observer
class SitesList extends React.Component {
    render() {
        return (
            <List>
                {appState.manageTabState.listItems.map(item => {
                    return (
                        <List.Item>
                            <SingleSite item={item}/>
                        </List.Item>
                    );
                })}
            </List>
        );
    }
}

@observer
class AddSiteInput extends React.Component {
    input = {
        value: ''
    };

    handleChange = e => {
        console.log(e.target.value);
        this.input.value = e.target.value;
    }

    handleClick = () => {
        // const newSite =
    }

    render() {
        return (
            <div className='add-site-input'>
                <Input suffix={<img src={inputIcon} alt=''/>} value={this.input.value} onChange={this.handleChange}/>
                <span onClick={this.handleClick}>Add</span>
            </div>
        );
    }
}

@observer
class ManageTab extends React.Component {
    get isEmpty() {
        return appState.manageTabState.listItems.length <= 0;
    }

    render() {
        return (
            <div className='manage-tab' style={{
                display: appState.activeTabKey === 'manage' ? 'block' : 'none'
            }}>
                <InfoSitesList/>
                <Empty
                    style={{display: this.isEmpty ? 'block' : 'none'}}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description='No Data'
                />
                <div
                    className='sites-list'
                    style={{display: !this.isEmpty ? 'block' : 'none'}}
                >
                    <Scrollbar>
                        <SitesList/>
                    </Scrollbar>
                </div>
                <AddSiteInput/>
            </div>
        );
    }
}

@observer
class App extends React.Component {
    constructor(props) {
        super(props);
    }

    // componentDidMount() {
    //     const asyncFunc = async () => {
    //         // only invoke after first rendering
    //         let response = await new Promise(resolve => {
    //             chrome.runtime.sendMessage({reqType: "popupQuery"}, response1 => {
    //                 resolve(response1);
    //             });
    //         });
    //         this.setState({
    //             enabled: response.enabled,
    //             domain: response.domain,
    //             faviconUrl: response.faviconUrl,
    //             locked: response.locked
    //         });
    //     };
    //     asyncFunc.bind(this)();
    // }

    render() {
        return (
            <>
                <Header/>
                <MenuBar/>
                <HomeTab/>
                <TrackersTab/>
                <ManageTab/>
            </>
        );
    }
}

// data for test purpose
const appState = observable({
    activeTabKey: 'manage',
    homeTabState: {
        faviconUrl: 'chrome://favicon/size/24@1x/https://www.google.com',
        domain: 'www.google.com',
        cookieSwitchState: false,
        trackersSwitchState: true
    },
    trackersTabState: {
        listItems: []
    },
    manageTabState: {
        listItems: []
    }
});

ReactDOM.render(<App/>, document.getElementById('root'));