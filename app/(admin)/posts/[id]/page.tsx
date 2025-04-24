import React, { use} from 'react'
import PostForm from '@/components/post/PostForm';

type Params = {
    id: string
}

const page = ({ params: paramsPromise }: { params: Promise<Params> }) => {
    const { id } = use(paramsPromise)
    return (
        <PostForm mode="edit" postId={id} />
    )
}

export default page