import Button from '@geist-ui/core/dist/button'
import useToasts from '@geist-ui/core/dist/use-toasts'
import ButtonDropdown from '@geist-ui/core/dist/button-dropdown'

import { useRouter } from 'next/router';
import { useCallback, useState } from 'react'
import generateUUID from '@lib/generate-uuid';
import DocumentComponent from '../document';
import FileDropzone from './drag-and-drop';
import styles from './post.module.css'
import Title from './title';
import Cookies from 'js-cookie'
import type { PostVisibility, Document as DocumentType } from '@lib/types';
import PasswordModal from './password';
import getPostPath from '@lib/get-post-path';

const Post = () => {
    const { setToast } = useToasts()
    const router = useRouter();
    const [title, setTitle] = useState<string>()
    const [docs, setDocs] = useState<DocumentType[]>([{
        title: '',
        content: '',
        id: generateUUID()
    }])
    const [passwordModalVisible, setPasswordModalVisible] = useState(false)
    const sendRequest = useCallback(async (url: string, data: { visibility?: PostVisibility, title?: string, files?: DocumentType[], password?: string, userId: string }) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('drift-token')}`
            },
            body: JSON.stringify({
                title,
                files: docs,
                ...data,
            })
        })

        if (res.ok) {
            const json = await res.json()
            router.push(getPostPath(json.visibility, json.id))
        } else {
            const json = await res.json()
            setToast({
                text: json.error.message,
                type: 'error'
            })
            setPasswordModalVisible(false)
            setSubmitting(false)
        }

    }, [docs, router, setToast, title])

    const [isSubmitting, setSubmitting] = useState(false)

    const remove = (id: string) => {
        setDocs(docs.filter((doc) => doc.id !== id))
    }

    const onSubmit = async (visibility: PostVisibility, password?: string) => {
        console.log(visibility, password, passwordModalVisible)
        if (visibility === 'protected' && !password) {
            setPasswordModalVisible(true)
            return
        }
        setSubmitting(true)

        await sendRequest('/server-api/posts/create', {
            title,
            files: docs,
            visibility,
            password,
            userId: Cookies.get('drift-userid') || ''
        })
    }

    const onClosePasswordModal = () => {
        setPasswordModalVisible(false)
        setSubmitting(false)
    }

    const updateTitle = useCallback((title: string, id: string) => {
        setDocs(docs.map((doc) => doc.id === id ? { ...doc, title } : doc))
    }, [docs])

    const updateContent = useCallback((content: string, id: string) => {
        setDocs(docs.map((doc) => doc.id === id ? { ...doc, content } : doc))
    }, [docs])

    const uploadDocs = useCallback((files: DocumentType[]) => {
        // if no title is set and the only document is empty,
        const isFirstDocEmpty = docs.length <= 1 && (docs.length ? docs[0].title === '' : true)
        const shouldSetTitle = !title && isFirstDocEmpty
        if (shouldSetTitle) {
            if (files.length === 1) {
                setTitle(files[0].title)
            } else if (files.length > 1) {
                setTitle('Uploaded files')
            }
        }

        if (isFirstDocEmpty) setDocs(files)
        else setDocs([...docs, ...files])
    }, [docs, title])

    return (
        <div>
            <Title title={title} setTitle={setTitle} />
            <FileDropzone setDocs={uploadDocs} />
            {
                docs.map(({ content, id, title }) => {
                    return (
                        <DocumentComponent
                            remove={() => remove(id)}
                            key={id}
                            editable={true}
                            setContent={(content) => updateContent(content, id)}
                            setTitle={(title) => updateTitle(title, id)}
                            content={content}
                            title={title}
                        />
                    )
                })
            }

            <div className={styles.buttons}>
                <Button
                    className={styles.button}
                    onClick={() => {
                        setDocs([...docs, {
                            title: '',
                            content: '',
                            id: generateUUID()
                        }])
                    }}
                    style={{ flex: .5, lineHeight: '40px' }}
                    type="default"
                >
                    Add a File
                </Button>

                <ButtonDropdown loading={isSubmitting} type="success">
                    <ButtonDropdown.Item main onClick={() => onSubmit('private')}>Create Private</ButtonDropdown.Item>
                    <ButtonDropdown.Item onClick={() => onSubmit('public')} >Create Public</ButtonDropdown.Item>
                    <ButtonDropdown.Item onClick={() => onSubmit('unlisted')} >Create Unlisted</ButtonDropdown.Item>
                    <ButtonDropdown.Item onClick={() => onSubmit('protected')} >Create with Password</ButtonDropdown.Item>
                </ButtonDropdown>
                <PasswordModal isOpen={passwordModalVisible} onClose={onClosePasswordModal} onSubmit={(password) => onSubmit('protected', password)} />
            </div>
        </div>
    )
}

export default Post
