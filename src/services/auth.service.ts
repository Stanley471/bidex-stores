import { createToken } from '@/lib/auth/jwt'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import type { LoginInput, RegisterInput } from '@/lib/auth/validation'
import { prisma } from '@/lib/prisma'

class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    if (existingUser) {
      throw new Error('A user with this email already exists.')
    }

    const hashedPassword = await hashPassword(input.password)

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user || !user.password) {
      throw new Error('Invalid email or password.')
    }

    const isPasswordValid = await verifyPassword(input.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password.')
    }

    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    const { password: _password, ...safeUser } = user

    return {
      token,
      user: safeUser,
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('Authentication failed.')
    }

    return user
  }

  async hasAdmin(): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        role: 'ADMIN',
      },
    })
    return count > 0
  }

  async setupFirstAdmin(input: RegisterInput) {
    const adminExists = await this.hasAdmin()

    if (adminExists) {
      throw new Error('First administrator setup is already completed.')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new Error('A user with this email already exists.')
    }

    const hashedPassword = await hashPassword(input.password)

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      token,
      user,
    }
  }

  async handleGoogleCallbackUser(profile: {
    providerAccountId: string
    email: string
    name: string
    emailVerified: boolean
  }) {
    const email = profile.email.toLowerCase().trim()

    if (!prisma.account) {
      throw new Error('Prisma Client does not have the Account model initialized. Please restart your dev server.')
    }

    // 1. Search for existing linked Account by provider + providerAccountId
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (existingAccount) {
      const user = existingAccount.user
      const token = await createToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      })
      return { token, user }
    }

    // 2. Search for existing User by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    let userToLogin = existingUser

    if (existingUser) {
      // Security check: Only link if Google confirmed email is verified
      if (!profile.emailVerified) {
        throw new Error('Unverified Google email address cannot be linked to existing account.')
      }

      await prisma.account.create({
        data: {
          userId: existingUser.id,
          provider: 'google',
          providerAccountId: profile.providerAccountId,
        },
      })

      if (!existingUser.emailVerified) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerified: new Date() },
        })
      }
    } else {
      // 3. Create new User + Account link
      userToLogin = await prisma.user.create({
        data: {
          name: profile.name.trim() || email.split('@')[0],
          email,
          password: null,
          role: 'CUSTOMER',
          emailVerified: profile.emailVerified ? new Date() : null,
          accounts: {
            create: {
              provider: 'google',
              providerAccountId: profile.providerAccountId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    if (!userToLogin) {
      throw new Error('Failed to authenticate user.')
    }

    const token = await createToken({
      sub: userToLogin.id,
      email: userToLogin.email,
      role: userToLogin.role,
    })

    return { token, user: userToLogin }
  }
}

export const authService = new AuthService()
