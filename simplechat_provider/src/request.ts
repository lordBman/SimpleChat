import { useCallback, useEffect, useState } from "react"

interface RequestProps<T>{
    fn: () => Promise<T>
}

const useRequest = <T>(props: RequestProps<T>) =>{
    const [state, setState] = useState<{ loading: boolean, error?: any, data?: T }>({ loading: true });

    const callback = useCallback(()=>{
        props.fn().then((data)=>{
            setState({ loading: false, data });
        }).catch((error)=>{
            setState({ loading: false, error });
        })
    }, [props]);

    useEffect(()=>{
        if(!state.data){
            callback();
        }
    }, [callback, props]);

    return { ...state }
}

interface CallbackRequestProps<T, R>{
    request: (input: R) => Promise<T>
    onStart?: ()=> void,
    onDone?: (data: T)=> void
    onFail?: (error: any) =>void
}

const useCallbackRequest = <T, R>(props: CallbackRequestProps<T, R>) =>{
    const [state, setState] = useState<{ loading: boolean, error?: any, data?: T }>({ loading: false });

    const callback = useCallback((input: R)=>{
        setState({ loading: true });
        if(props.onStart){
            props.onStart();
        }
        props.request(input).then((data)=>{
            setState({ loading: false, data });
            if(props.onDone){
                props.onDone(data);
            }
        }).catch((error)=>{
            setState({ loading: false, error });
            if(props.onFail){
                props.onFail(error);
            }
        })
    }, [props]);

    const start = (input: R)=> {
        if(!state.loading){
            callback(input);
        }
    }

    return { ...state, start }
}

export { useRequest, useCallbackRequest }