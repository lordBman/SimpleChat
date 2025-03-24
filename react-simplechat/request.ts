import { useCallback, useEffect, useState } from "react";

const useRequest = <T>(props: { fn: () => Promise<T> }) =>{
    const [ state, setState ] = useState<{ data?: T, error?: any, loading: boolean, isError: boolean }>({ loading: true, isError: false });

    const init = useCallback(()=>{
        props.fn().then((value)=>{
            setState(init => { return { ...init, data: value } });
        }).catch((error)=>{
            setState(init => { return { ...init, error: error, isError: true } });
        }).finally(()=>{
            setState(init => { return { ...init, loading: false } });
        });
    }, [props.fn]);

    useEffect(()=> init(), [init, props.fn]);

    return state;
}

const useRequestCallBack = <T>(props: { fn: () => Promise<T>,  started?: () => void, success?: (data: T) => void, failed?: (error: any) => void }) =>{
    const [ state, setState ] = useState<{ data?: T, error?: any, loading: boolean, isError: boolean }>({ loading: false, isError: false });

    const init = useCallback(()=>{
        setState(init => { return { ...init, loading: true } });
        props.started && props.started();
        props.fn().then((value)=>{
            setState(init => { return { ...init, data: value } });
            props.success && props.success(value);
        }).catch((error)=>{
            setState(init => { return { ...init, error: error, isError: true } });
            props.failed && props.failed(error);
        }).finally(()=>{
            setState(init => { return { ...init, loading: false } });
        });
    }, [props.fn]);

    const run = () => init();

    return { ...state, run };
}

export { useRequest, useRequestCallBack };