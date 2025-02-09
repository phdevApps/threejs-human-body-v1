import React from 'react';
import ModelViewer from './ModelViewer.tsx';
import './App.scss';





const App: React.FC = () => {


    return (
        <>
            <div className="header">
                <div className="logo_box"><a href="#" className="logo_box__logo"></a></div>
                <div className="navbar">
                    <div className="navbar__cross hidden" >
                    </div>
                    <a href="#" className="navbar__item active" id="dashboard">
                        <div className="navbar__item__icon"></div>
                        <span className="navbar__item__text">Dashboard</span>
                    </a>
                    <a href="#" className="navbar__item" id="Goals">
                        <div className="navbar__item__icon"></div>
                        <span className="navbar__item__text">Goals</span>
                    </a>
                    <a href="#" className="navbar__item" id="Report">
                        <div className="navbar__item__icon"></div>
                        <span className="navbar__item__text">Report</span>
                    </a>
                    <a href="#" className="navbar__item" id="Supplements">
                        <div className="navbar__item__icon"></div>
                        <span className="navbar__item__text">Supplements</span>
                    </a>
                    <a href="#" className="navbar__item" id="Tests">
                        <div className="navbar__item__icon"></div>
                        <span className="navbar__item__text">Tests</span>
                    </a>
                </div>
                <div className="account_info">
                    <div className="account_info__item" id="notifications"><div className="account_info__item__icon"></div></div>
                    <div className="account_info__item" id="user"><div className="account_info__item__icon"></div></div>
                    <div className="account_info__item hidden" id="menu"><div className="account_info__item__icon"></div></div>
                </div>
            </div>

            <div className="wellness_report">
                <div className="wellness_report__item" id="upper">
                    <div className="wellness_report__item__icon"></div>
                </div>
                <div className="wellness_report__item" id="lower">
                    <div className="wellness_report__item__icon"></div>
                </div>
            </div>

            <div className="wellness_report__card">
                <div className="wellness_report__card__issues_count hidden">+2</div>
                <div className="wellness_report__card__description">More Risks considered for your wellness</div>
                <div className="wellness_report__card__progressbar">
                    <div className="wellness_report__card__progressbar__bar"></div>
                    <div className="wellness_report__card__progressbar__percentage">100%</div>
                </div>
                <a href="#" className="wellness_report__card__order_test">Order DNA Test</a>
            </div>

            <div className="controls">
                <div className="controls__zoom_in" id="zoom_in">
                    <div className="controls__zoom_in__icon"></div>
                </div>
                <div className="controls__zoom_out" id="zoom_out">
                    <div className="controls__zoom_out__icon"></div>
                </div>
                <div className="controls__full_screen" id="full_screen">
                    <div className="controls__full_screen__icon"></div>
                </div>
            </div>

            <div className="display__layer">

                <ModelViewer />
            </div>
        </>
    )
};

export default App;
