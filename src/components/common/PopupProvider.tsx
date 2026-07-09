import React, { createContext, useContext, useState } from 'react';
import Popup from './Popup';
import VehicleSearchPopup from './VehicleSearchPopup';
import ClientSearchPopup from './ClientSearchPopup';
import ProdSearchPopup from './ProdSearchPopup';
import LocSearchPopup from './LocSearchPopup';
import ZoneSearchPopup from './ZoneSearchPopup';

interface MsgState {
    isOpen    : boolean;
    type      : 'alert' | 'confirm';
    message   : string;
    onConfirm : () => void;
}

interface VehicleState { isOpen: boolean; onSelect: (vehicleNo: string, drvNm: string) => void; }
interface ClientState  { isOpen: boolean; clientCd?: string; onSelect: (clientCd: string, clientNm: string) => void; }
interface ProdState    { isOpen: boolean; prodCd?: string; onSelect: (prodCd: string, prodNm: string) => void; }
interface LocState     { isOpen: boolean; zoneCd?: string; onSelect: (locCd: string) => void; }
interface ZoneState    { isOpen: boolean; zoneCd?: string; onSelect: (zoneCd: string, zoneNm: string) => void; }

interface PopupContextType {
    showAlert         : (message: string, onClose?: () => void) => void;
    showConfirm       : (message: string, onConfirm: () => void) => void;
    closeAlert        : () => void;
    openVehicleSearch : (onSelect: (vehicleNo: string, drvNm: string) => void) => void;
    openClientSearch  : (onSelect: (clientCd: string, clientNm: string) => void, clientCd?: string) => void;
    openProdSearch    : (onSelect: (prodCd: string, prodNm: string) => void, prodCd?: string) => void;
    openLocSearch     : (onSelect: (locCd: string) => void, zoneCd?: string) => void;
    openZoneSearch    : (onSelect: (zoneCd: string, zoneNm: string) => void, zoneCd?: string) => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

const CLOSED_VEHICLE : VehicleState = { isOpen: false, onSelect: () => {} };
const CLOSED_CLIENT  : ClientState  = { isOpen: false, onSelect: () => {} };
const CLOSED_PROD    : ProdState    = { isOpen: false, onSelect: () => {} };
const CLOSED_LOC     : LocState     = { isOpen: false, onSelect: () => {} };
const CLOSED_ZONE    : ZoneState    = { isOpen: false, onSelect: () => {} };

export const PopupProvider: React.FC<{
    srvcCd?  : string;
    whCd?    : string;
    children : React.ReactNode;
}> = ({ srvcCd = '', whCd = '', children }) => {
    const [msg,     setMsg]     = useState<MsgState>({ isOpen: false, type: 'alert', message: '', onConfirm: () => {} });
    const [vehicle, setVehicle] = useState<VehicleState>(CLOSED_VEHICLE);
    const [client,  setClient]  = useState<ClientState>(CLOSED_CLIENT);
    const [prod,    setProd]    = useState<ProdState>(CLOSED_PROD);
    const [loc,     setLoc]     = useState<LocState>(CLOSED_LOC);
    const [zone,    setZone]    = useState<ZoneState>(CLOSED_ZONE);

    const closeMsg = () => setMsg(p => ({ ...p, isOpen: false }));

    const showAlert = (message: string, onClose?: () => void) =>
        setMsg({ isOpen: true, type: 'alert', message, onConfirm: () => { closeMsg(); if (onClose) setTimeout(onClose, 0); } });

    const showConfirm = (message: string, onConfirm: () => void) =>
        setMsg({ isOpen: true, type: 'confirm', message, onConfirm: () => { closeMsg(); onConfirm(); } });

    const openVehicleSearch = (onSelect: (vehicleNo: string, drvNm: string) => void) =>
        setVehicle({ isOpen: true, onSelect });

    const openClientSearch = (onSelect: (clientCd: string, clientNm: string) => void, clientCd?: string) =>
        setClient({ isOpen: true, clientCd, onSelect });

    const openProdSearch = (onSelect: (prodCd: string, prodNm: string) => void, prodCd?: string) =>
        setProd({ isOpen: true, prodCd, onSelect });

    const openLocSearch = (onSelect: (locCd: string) => void, zoneCd?: string) =>
        setLoc({ isOpen: true, onSelect, zoneCd });

    const openZoneSearch = (onSelect: (zoneCd: string, zoneNm: string) => void, zoneCd?: string) =>
        setZone({ isOpen: true, zoneCd, onSelect });

    return (
        <PopupContext.Provider value={{ showAlert, showConfirm, closeAlert: closeMsg, openVehicleSearch, openClientSearch, openProdSearch, openLocSearch, openZoneSearch }}>
            {children}
            <Popup
                isOpen    = {msg.isOpen}
                message   = {msg.message}
                type      = {msg.type}
                onConfirm = {msg.onConfirm}
                onCancel  = {closeMsg}
            />
            <VehicleSearchPopup
                isOpen   = {vehicle.isOpen}
                srvcCd   = {srvcCd}
                whCd     = {whCd}
                onSelect = {vehicle.onSelect}
                onClose  = {() => setVehicle(CLOSED_VEHICLE)}
            />
            <ClientSearchPopup
                isOpen          = {client.isOpen}
                srvcCd          = {srvcCd}
                whCd            = {whCd}
                initialClientCd = {client.clientCd}
                onSelect        = {client.onSelect}
                onClose         = {() => setClient(CLOSED_CLIENT)}
            />
            <ProdSearchPopup
                isOpen        = {prod.isOpen}
                srvcCd        = {srvcCd}
                whCd          = {whCd}
                initialProdCd = {prod.prodCd}
                onSelect      = {prod.onSelect}
                onClose       = {() => setProd(CLOSED_PROD)}
            />
            <LocSearchPopup
                isOpen   = {loc.isOpen}
                srvcCd   = {srvcCd}
                whCd     = {whCd}
                zoneCd   = {loc.zoneCd}
                onSelect = {loc.onSelect}
                onClose  = {() => setLoc(CLOSED_LOC)}
            />
            <ZoneSearchPopup
                isOpen        = {zone.isOpen}
                srvcCd        = {srvcCd}
                whCd          = {whCd}
                initialZoneCd = {zone.zoneCd}
                onSelect      = {zone.onSelect}
                onClose       = {() => setZone(CLOSED_ZONE)}
            />
        </PopupContext.Provider>
    );
};

export const usePopupContext = () => {
    const ctx = useContext(PopupContext);
    if (!ctx) throw new Error('usePopupContext must be used within PopupProvider');
    return ctx;
};
