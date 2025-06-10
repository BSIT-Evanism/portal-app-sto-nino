import { db } from "@/db";
import { brgyOfficerPosition, brgyOfficials, brgyPrograms, brgyStaff, downloadableContent, highlights, postContent, posts, priority, requests, requestUpdateForm, requestUpdates, sectionSequence, user, brgyEvents, brgyPromotionCategories, brgyPromotion } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { utapi } from "@/utconfig/uploadthing";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { eq, inArray, sql, SQL } from "drizzle-orm";
import { text } from "drizzle-orm/mysql-core";
import { UTFile } from "uploadthing/server";

export const admin = {
    createPost: defineAction({
        accept: 'json',
        input: z.object({
            title: z.string(),
            type: z.enum(['announcement', 'news']),
            shortDescription: z.string(),
            image: z.string().regex(/^https?:\/\/.+/).optional(),
        }),
        handler: async (input, context) => {

            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to create a post'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to create a post'
                })
            }

            const newPost = await db.transaction(async (tx) => {

                const [post] = await tx.insert(posts).values({
                    id: generateId(),
                    title: input.title,
                    type: input.type as 'announcement' | 'news',
                    userId: context.locals.user?.id ?? '',
                    image: input.image,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    shortDescription: input.shortDescription,
                }).returning()

                if (!post) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create post'
                    })
                }

                await tx.insert(postContent).values({
                    postId: post.id,
                    content: null,
                })

                return {
                    success: true,
                    postId: post.id
                }

            })

            return newPost

        }
    }),
    updatePostVisibility: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string(),
            public: z.boolean(),
        }),
        handler: async (input, context) => {
            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to update post visibility'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to update post visibility'
                })
            }

            const [post] = await db.update(posts).set({
                public: input.public
            }).where(eq(posts.id, input.postId)).returning()

            if (!post) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update post visibility'
                })
            }

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    editPostContent: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string().regex(/^pst-\d{4}-\d{2}-\d{2}-[a-zA-Z0-9]{4}$/),
            content: z.array(z.any())
        }),
        handler: async (input, context) => {

            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to edit post content'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to edit post content'
                })
            }

            const content = await db.transaction(async (tx) => {
                const [postResult] = await tx.select().from(posts).where(eq(posts.id, input.postId))

                if (!postResult) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Post not found'
                    })
                }

                await tx.update(postContent).set({
                    content: input.content,
                }).where(eq(postContent.postId, input.postId)).returning()

                const [post] = await tx.update(posts).set({
                    updatedAt: new Date()
                }).where(eq(posts.id, input.postId)).returning()

                if (!post) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update post content'
                    })
                }

                return {
                    success: true,
                    postId: post.id
                }


            })

            return content

        }
    }),
    editGridLayout: defineAction({
        accept: 'json',
        input: z.object({
            layout: z.array(z.number())
        }),
        handler: async (input, context) => {
            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to edit grid layout'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to edit grid layout'
                })
            }

            const [grid] = await db.update(sectionSequence).set({
                sequence: input.layout
            }).where(eq(sectionSequence.id, '1')).returning()

            if (!grid) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update grid layout'
                })
            }

            return {
                success: true,
                gridId: grid.id
            }

        }
    }),
    deletePost: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [prio] = await db.select().from(priority).where(eq(priority.postId, input.postId))

            if (prio) {
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: 'Post is priority post'
                })
            }

            const [post] = await db.update(posts).set({
                deletedAt: new Date()
            }).where(eq(posts.id, input.postId)).returning()

            if (!post) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Post not found'
                })
            }

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    unarchivePost: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [post] = await db.update(posts).set({
                deletedAt: null
            }).where(eq(posts.id, input.postId)).returning()

            if (!post) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Post not found'
                })
            }

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    editPostDetails: defineAction({
        accept: 'form',
        input: z.object({
            postId: z.string(),
            title: z.string(),
            shortDescription: z.string(),
            type: z.enum(['announcement', 'news']),
            image: z.string().regex(/^https?:\/\/.+/).optional(),
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [post] = await db.update(posts).set({
                title: input.title,
                shortDescription: input.shortDescription,
                type: input.type as 'announcement' | 'news',
                image: input.image,
            }).where(eq(posts.id, input.postId)).returning()

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    managePriority: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string().optional(),
            priority: z.array(z.object({
                id: z.string(),
                priority: z.number()
            })).optional(),
            priorityNumber: z.number().optional(),
            mode: z.enum(['add', 'remove', 'arrange'])
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            if (input.mode === 'add') {

                if (!input.postId) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Post ID is required'
                    })
                }

                const maxValue = await db.select({ max: sql<number>`max(${priority.priority})` }).from(priority).execute()

                if (maxValue[0].max >= 10) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Maximum priority value reached'
                    })
                }

                const [data] = await db.insert(priority).values({
                    postId: input.postId,
                    priority: maxValue[0].max + 1
                }).returning()
            }

            if (input.mode === 'remove') {

                if (!input.postId) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Post ID is required'
                    })
                }

                const [data] = await db.delete(priority).where(eq(priority.postId, input.postId)).returning()
            }

            if (input.mode === 'arrange') {
                if (!input.priority) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Priority is required'
                    })
                }

                const sqlChunks: SQL[] = []
                const ids: string[] = [];

                sqlChunks.push(sql`(case`);
                for (const prio of input.priority) {
                    sqlChunks.push(sql`when post_id = ${prio.id} then ${prio.priority}`);
                    ids.push(prio.id);
                }
                sqlChunks.push(sql`end)`);

                const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));

                const [data] = await db.update(priority).set({
                    priority: finalSql
                }).where(inArray(priority.postId, ids)).returning()

                if (!data) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to arrange priority'
                    })
                }

                await fetch('/api/feed/cache/invalidate', {
                    method: 'POST',
                    headers: Object.fromEntries(context.request.headers.entries())
                })

                return {
                    success: true,
                    data: data
                }
            }
        }
    }),
    approveUser: defineAction({
        accept: 'json',
        input: z.object({
            userId: z.string(),
            approved: z.boolean()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const userDetails = await db.update(user).set({
                approved: input.approved
            }).where(eq(user.id, input.userId)).returning()

            if (!userDetails) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'User not found'
                })
            }

            return {
                success: true,
                userDetails: userDetails
            }
        }
    }),
    addRequestUpdate: defineAction({
        accept: 'json',
        input: z.object({
            requestId: z.string(),
            message: z.string(),
            type: z.enum(['urgent', 'normal', 'form']),
            status: z.enum(['submitted', 'reviewed', 'approved', 'rejected']),
            formType: z.enum(['residence', 'indigency', 'clearance']).nullable(),
            closedChat: z.boolean().default(true)
        }).refine((e) => {
            if (e.type === 'form') {
                return e.formType !== null;
            }
            return true;
        }, {
            message: 'Please select a form type'
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const reqUpdate = await db.transaction(async (tx) => {

                const [request] = await tx.select().from(requests).where(eq(requests.id, input.requestId))

                if (!request) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Request not found'
                    })
                }


                const [reqUp] = await tx.insert(requestUpdates).values({
                    requestId: input.requestId,
                    message: input.message,
                    type: input.type,
                    updateClose: input.closedChat,
                }).returning()

                if (input.type === 'form') {
                    await tx.insert(requestUpdateForm).values({
                        requestId: reqUp.id,
                        docType: input.formType as 'clearance' | 'indigency' | 'residence',
                        userId: request.userId,
                    })
                }

                if (input.status !== request.status) {
                    await tx.update(requests).set({
                        status: input.status
                    }).where(eq(requests.id, input.requestId))
                }

                return {
                    success: true,
                    requestUpdate: reqUp
                }
            })

            return reqUpdate

        }
    }),
    addHighlight: defineAction({
        accept: 'json',
        input: z.object({
            image: z.string().regex(/^https?:\/\/.+/),
            caption: z.string(),
            link: z.string().regex(/^https?:\/\/.+/).optional()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [highl] = await db.insert(highlights).values({
                image: input.image,
                caption: input.caption,
                link: input.link || null
            }).returning()

            if (!highl) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add highlight'
                })
            }

            return {
                success: true,
                highlight: highl
            }

        }
    }),
    addDownloadableResource: defineAction({
        accept: 'form',
        input: z.object({
            file: z.instanceof(File).refine(file => file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {
                message: 'Please provide a PDF or DOCX file'
            }),
            caption: z.string()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const downloadableResource = await db.transaction(async (tx) => {

                const fileLink = await utapi.uploadFiles(new UTFile([input.file], input.file.name, { type: input.file.type }))

                if (!fileLink.data) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to upload file'
                    })
                }

                const getUrl = await utapi.getSignedURL(fileLink.data.key)

                if (!getUrl.url) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to get signed URL'
                    })
                }

                const [downloadableResource] = await db.insert(downloadableContent).values({
                    fileLink: getUrl.url,
                    fileId: fileLink.data.key,
                    caption: input.caption
                }).returning()

                return {
                    success: true,
                    downloadableResource: downloadableResource
                }

            })

            return downloadableResource

        }
    }),
    deleteFile: defineAction({
        accept: 'json',
        input: z.object({
            fileId: z.string()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const fileReturn = await db.transaction(async (tx) => {

                const fileDelete = await utapi.deleteFiles([
                    input.fileId
                ])

                if (!fileDelete.success) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to delete file'
                    })
                }

                const [file] = await tx.delete(downloadableContent).where(eq(downloadableContent.fileId, input.fileId)).returning()

                if (!file) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'File not found'
                    })
                }

                return file
            })

            return {
                success: true,
                fileId: fileReturn.fileId
            }
        }
    }),
    closeChat: defineAction({
        accept: 'json',
        input: z.object({
            requestLogId: z.string()
        }),
        handler: async (input, context) => {

            await authMiddleware(context)

            const [requestLog] = await db.update(requestUpdates).set({
                updateClose: true
            }).where(eq(requestUpdates.id, input.requestLogId)).returning()

            if (!requestLog) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Request log not found'
                })
            }

            return {
                success: true,
                requestLogId: requestLog.id
            }
        }
    }),
    removeHighlight: defineAction({
        accept: 'json',
        input: z.object({
            highlightId: z.number()
        }),
        handler: async (input, context) => {
            authMiddleware(context)

            const [highl] = await db.delete(highlights).where(eq(highlights.id, input.highlightId)).returning()

            if (!highl) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Highlight not found'
                })
            }
            return {
                success: true,
                highlightId: highl.id
            }
        }
    }),
    reopenForm: defineAction({
        accept: 'json',
        input: z.object({
            requestFormId: z.string()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [request] = await db.update(requestUpdateForm).set({
                form: null
            }).where(eq(requestUpdateForm.id, input.requestFormId)).returning()

            if (!request) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                })
            }

            return {
                success: true,
                requestId: request.id
            }
        }
    }),
    addOfficers: defineAction({
        accept: 'json',
        input: z.object({
            name: z.string(),
            position: z.enum(brgyOfficerPosition.enumValues),
            type: z.enum(['sk', 'main'])
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            if (input.type === 'sk') {

                const officers = await db.query.brgyStaff.findMany({
                    where: (table, { eq }) => eq(table.position, input.position)
                })

                if (input.position === 'chairman' || input.position === 'secretary' || input.position === 'treasurer') {
                    if (officers.length > 0) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Position already has an officer'
                        })
                    }
                }

                const officerRes = await db.insert(brgyStaff).values({
                    name: input.name,
                    position: input.position,
                }).returning()

                if (!officerRes) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to add officer'
                    })
                }

                return {
                    success: true,
                    officerId: officerRes[0].id
                }
            }

            if (input.type === 'main') {

                const officers = await db.query.brgyOfficials.findMany({
                    where: (table, { eq }) => eq(table.position, input.position)
                })

                if (input.position === 'chairman' || input.position === 'secretary' || input.position === 'treasurer') {
                    if (officers.length > 0) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Position already has an officer'
                        })
                    }
                }


                const officerRes = await db.insert(brgyOfficials).values({
                    name: input.name,
                    position: input.position,
                }).returning()

                if (!officerRes) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to add officer'
                    })
                }


                return {
                    success: true,
                    officerId: officerRes[0].id
                }

            }

            return

        },
    }),
    updateOfficers: defineAction({
        accept: 'json',
        input: z.object({
            officerId: z.number(),
            name: z.string(),
            position: z.enum(brgyOfficerPosition.enumValues),
            type: z.enum(['sk', 'main'])
        }),
        handler: async (input, context) => {
            await authMiddleware(context);

            if (input.type === 'sk') {
                // Check for unique chairman/secretary/treasurer
                if (["chairman", "secretary", "treasurer"].includes(input.position)) {
                    const officers = await db.query.brgyStaff.findMany({
                        where: (table, { eq, and }) => and(
                            eq(table.position, input.position),
                            // Exclude the current officer being updated
                            sql`id != ${input.officerId}`
                        )
                    });
                    if (officers.length > 0) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Position already has an officer'
                        });
                    }
                }
                const [officer] = await db.update(brgyStaff).set({
                    name: input.name,
                    position: input.position
                }).where(eq(brgyStaff.id, input.officerId)).returning();
                if (!officer) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Officer not found'
                    });
                }
                return {
                    success: true,
                    officerId: officer.id
                };
            }
            if (input.type === 'main') {
                if (["chairman", "secretary", "treasurer"].includes(input.position)) {
                    const officers = await db.query.brgyOfficials.findMany({
                        where: (table, { eq, and }) => and(
                            eq(table.position, input.position),
                            sql`id != ${input.officerId}`
                        )
                    });
                    if (officers.length > 0) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Position already has an officer'
                        });
                    }
                }
                const [officer] = await db.update(brgyOfficials).set({
                    name: input.name,
                    position: input.position
                }).where(eq(brgyOfficials.id, input.officerId)).returning();
                if (!officer) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Officer not found'
                    });
                }
                return {
                    success: true,
                    officerId: officer.id
                };
            }
            return;
        }
    }),
    deleteOfficer: defineAction({
        accept: 'json',
        input: z.object({
            officerId: z.number(),
            type: z.enum(['sk', 'main'])
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            if (input.type === 'sk') {
                const [officer] = await db.delete(brgyStaff).where(eq(brgyStaff.id, input.officerId)).returning()
                if (!officer) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Officer not found'
                    })
                }
            }

            if (input.type === 'main') {
                const [officer] = await db.delete(brgyOfficials).where(eq(brgyOfficials.id, input.officerId)).returning()
                if (!officer) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Officer not found'
                    })
                }
            }


            return {
                success: true,
                officerId: input.officerId
            }

        }
    }),
    addBrgyProgram: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string(),
            description: z.string(),
            image: z.instanceof(File)
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const program = await db.transaction(async (tx) => {

                const fileLink = await utapi.uploadFiles(new UTFile([input.image], input.image.name, { type: input.image.type }))

                if (!fileLink.data) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to upload file'
                    })
                }

                const [program] = await tx.insert(brgyPrograms).values({
                    name: input.name,
                    description: input.description,
                    imageId: fileLink.data.key
                }).returning()

                if (!program) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to add program'
                    })
                }

                return {
                    success: true,
                    programId: program.id
                }
            })

            return program
        }
    }),
    deleteBrgyProgram: defineAction({
        accept: 'json',
        input: z.object({
            programId: z.number()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [program] = await db.delete(brgyPrograms).where(eq(brgyPrograms.id, input.programId)).returning()

            if (!program) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Program not found'
                })
            }

            return {
                success: true,
                programId: program.id
            }
        }
    }),
    addBrgyEvent: defineAction({
        accept: 'form',
        input: z.object({
            title: z.string(),
            description: z.string(),
            startDate: z.string(),
            endDate: z.string(),
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [event] = await db.insert(brgyEvents).values({
                title: input.title,
                description: input.description,
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate),
            }).returning()

            if (!event) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add event'
                })
            }

            return {
                success: true,
                eventId: event.id
            }
        }
    }),
    deleteBrgyEvent: defineAction({
        accept: 'json',
        input: z.object({
            eventId: z.number()
        }),
        handler: async (input, context) => {
            await authMiddleware(context)

            const [event] = await db.delete(brgyEvents).where(eq(brgyEvents.id, input.eventId)).returning()

            if (!event) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Event not found'
                })
            }

            return {
                success: true,
                eventId: event.id
            }
        }
    }),
    addPromotionCategory: defineAction({
        accept: 'json',
        input: z.object({
            name: z.string().min(1, 'Category name is required'),
        }),
        handler: async (input, context) => {
            if (!context.locals.user || context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to add a category',
                });
            }
            const [category] = await db.insert(brgyPromotionCategories).values({
                name: input.name,
            }).returning();
            if (!category) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add category',
                });
            }
            return { success: true, category };
        },
    }),
    deletePromotionCategory: defineAction({
        accept: 'json',
        input: z.object({
            id: z.number(),
        }),
        handler: async (input, context) => {
            if (!context.locals.user || context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to delete a category',
                });
            }
            const [deleted] = await db.delete(brgyPromotionCategories).where(eq(brgyPromotionCategories.id, input.id)).returning();
            if (!deleted) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Category not found',
                });
            }
            return { success: true, id: input.id };
        },
    }),
    listPromotionCategories: defineAction({
        accept: 'json',
        input: z.object({}),
        handler: async (_input, context) => {
            if (!context.locals.user || context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to view categories',
                });
            }
            const categories = await db.select().from(brgyPromotionCategories).orderBy(brgyPromotionCategories.createdAt);
            return { success: true, categories };
        },
    }),
    addPromotion: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string(),
            imageId: z.instanceof(File).array(),
            category: z.enum(['Properties', 'Resorts', 'Churches', 'Farms', 'Nature']),
            address: z.string().optional(),
            description: z.string().optional(),
            coordinates: z.string().optional(),
        }),
        handler: async (input, context) => {
            if (!context.locals.user || context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to add a promotion',
                });
            }

            const fileLink = await utapi.uploadFiles(input.imageId)

            if (!fileLink.some(f => f.data)) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to upload file'
                })
            }

            const [promotion] = await db.insert(brgyPromotion).values({
                name: input.name,
                imageIdCarousel: fileLink.map(f => f.data?.key).filter(Boolean) as string[],
                category: input.category as 'Properties' | 'Resorts' | 'Churches' | 'Farms' | 'Nature',
                address: input.address,
                description: input.description,
                coordinates: input.coordinates,
            }).returning();
            if (!promotion) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add promotion',
                });
            }
            return { success: true, promotion };
        },
    }),
    deletePromotion: defineAction({
        accept: 'json',
        input: z.object({
            id: z.number(),
        }),
        handler: async (input, context) => {
            await authMiddleware(context)


            const [deleted] = await db.delete(brgyPromotion).where(eq(brgyPromotion.id, input.id)).returning();
            if (!deleted) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Promotion not found',
                });
            }
            const deletedImage = await utapi.deleteFiles(deleted.imageIdCarousel)
            if (!deletedImage) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete image',
                });
            }
            return { success: true, id: input.id };
        },
    }),
    listPromotions: defineAction({
        accept: 'json',
        input: z.object({}),
        handler: async (_input, context) => {
            if (!context.locals.user || context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to view promotions',
                });
            }
            const promotions = await db.select().from(brgyPromotion).orderBy(brgyPromotion.createdAt);
            return { success: true, promotions };
        },
    }),
}


const authMiddleware = async (context: ActionAPIContext) => {
    if (!context.locals.user) {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to delete a post'
        })
    }

    if (context.locals.user.role !== 'admin') {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'You must be an admin to delete a post'
        })
    }
}