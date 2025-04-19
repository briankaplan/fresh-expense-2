# System Patterns

## Architecture Overview

1. Memory Management

   - In-memory storage with persistence
   - Event-driven updates
   - Automatic cleanup strategies
   - Tag-based organization

2. Processing Pipeline

   - Event-driven architecture
   - Modular processing stages
   - Parallel processing capabilities
   - Error recovery mechanisms

3. Service Integration

   - Event bus communication
   - Asynchronous processing
   - Data consistency patterns
   - Circuit breaker pattern

## Design Patterns

### Frontend Patterns

#### Component Patterns

1. **Compound Components**

```typescript
// Example: Form components
<Form>
  <Form.Input name="email" />
  <Form.Select name="type" />
  <Form.Submit />
</Form>
```

2. **Render Props**

```typescript
// Example: Data fetching
<DataFetcher
  url="/api/data"
  render={data => (
    <DataDisplay data={data} />
  )}
/>
```

3. **Custom Hooks**

```typescript
// Example: Form handling
const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState(initialValues);
  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };
  return { values, handleChange };
};
```

#### State Management

1. **Context + Reducers**

```typescript
// Example: Auth context
const AuthContext = createContext<AuthState>(null);
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};
```

2. **Query Management**

```typescript
// Example: React Query
const { data, isLoading } = useQuery({
  queryKey: ['receipts'],
  queryFn: fetchReceipts,
  staleTime: 5 * 60 * 1000,
});
```

### Backend Patterns

#### Merchant Service Patterns

1. **Merchant Enrichment**

```typescript
@Injectable()
export class MerchantEnrichmentService extends BaseService {
  async enrichMerchantData(merchant: string): Promise<EnrichedData | null> {
    const prompt = `Analyze this merchant: ${merchant}`;
    const response = await this.aiService.analyze(prompt);
    return this.parseAIResponse(response);
  }
}
```

2. **Transaction Analysis**

```typescript
async processTransactions(transactions: TransactionData[]): Promise<EnrichedTransaction[]> {
  const analysis = await this.analyzeTransactions(transactions);
  return transactions.map(transaction => ({
    ...transaction,
    enrichedData: {
      ...analysis,
      category: determineCategory(transactions),
    },
  }));
}
```

3. **Subscription Detection**

```typescript
function detectSubscription(transactions: TransactionData[]): SubscriptionInfo {
  const intervals = calculateIntervals(transactions);
  const frequency = determineFrequency(intervals);
  return {
    isSubscription: isRecurring(intervals),
    frequency,
    nextPaymentDate: predictNextPayment(transactions, frequency),
  };
}
```

#### String Comparison Patterns

1. **Text Normalization**

```typescript
const normalizeText = (text: string, options: NormalizeOptions = {}): string => {
  let normalized = text.toLowerCase().trim();
  if (options.removeNonAlphanumeric) {
    normalized = normalized.replace(/[^a-z0-9]/g, '');
  }
  return normalized;
};
```

2. **Levenshtein Distance**

```typescript
const calculateLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));
  // ... distance calculation logic
  return matrix[str2.length][str1.length];
};
```

3. **Jaccard Similarity**

```typescript
const calculateJaccardSimilarity = (text1: string, text2: string): number => {
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};
```

#### Service Layer

1. **Repository Pattern**

```typescript
@Injectable()
export class ReceiptRepository {
  constructor(
    @InjectModel(Receipt.name)
    private receiptModel: Model<Receipt>
  ) {}

  async findById(id: string): Promise<Receipt> {
    return this.receiptModel.findById(id).exec();
  }
}
```

2. **Unit of Work**

```typescript
@Injectable()
export class ReceiptService {
  constructor(
    private readonly repository: ReceiptRepository,
    private readonly unitOfWork: UnitOfWork
  ) {}

  async createReceipt(data: CreateReceiptDto): Promise<Receipt> {
    return this.unitOfWork.withTransaction(async () => {
      const receipt = await this.repository.create(data);
      await this.processReceipt(receipt);
      return receipt;
    });
  }
}
```

#### Error Handling

1. **Exception Filter**

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
```

2. **Custom Exceptions**

```typescript
export class ReceiptNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Receipt with ID ${id} not found`);
  }
}
```

### Authentication and Email Patterns

#### JWT Token Management

1. **Token Generation**

```typescript
// Base token generation with type safety
export interface TokenPayload {
  userId: string;
  [key: string]: any;
}

export interface TokenOptions {
  expiresIn: string;
  audience?: string | string[];
  issuer?: string;
}

export function generateToken(
  payload: TokenPayload,
  secret: string,
  options: TokenOptions
): string {
  if (!secret) {
    throw new Error('JWT secret is required');
  }
  return jwt.sign(payload, secret, options);
}
```

2. **Purpose-Specific Tokens**

```typescript
// Email verification token (24h expiry)
export function generateEmailVerificationToken(userId: string, secret: string): string {
  return generateToken({ userId }, secret, { expiresIn: '24h' });
}

// Password reset token (1h expiry)
export function generatePasswordResetToken(userId: string, secret: string): string {
  return generateToken({ userId }, secret, { expiresIn: '1h' });
}
```

3. **Token Verification**

```typescript
export function verifyToken<T = any>(token: string, secret: string): T {
  if (!token) {
    throw new Error('Token is required');
  }
  if (!secret) {
    throw new Error('JWT secret is required');
  }
  return jwt.verify(token, secret) as T;
}
```

#### Email Templates

1. **Link Generation**

```typescript
// Verification link with token
export function generateVerificationLink(baseUrl: string, token: string): string {
  return `${baseUrl}/verify-email?token=${token}`;
}

// Password reset link with token
export function generatePasswordResetLink(baseUrl: string, token: string): string {
  return `${baseUrl}/reset-password?token=${token}`;
}
```

2. **Email Content Generation**

```typescript
// Verification email content
export function generateVerificationEmailContent(verificationLink: string): string {
  return `
    <h1>Welcome to Fresh Expense!</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;
}

// Password reset email content
export function generatePasswordResetEmailContent(resetLink: string): string {
  return `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
}
```

#### Auth Guard Integration

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest(err: any, user: any) {
    return handleAuthResult(err, user);
  }
}
```

#### Email Service Integration

```typescript
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not configured');
    }

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const token = generateEmailVerificationToken(user.id, jwtSecret);
    const verificationLink = generateVerificationLink(frontendUrl, token);
    const emailContent = generateVerificationEmailContent(verificationLink);

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: user.email,
      subject: 'Verify your email',
      html: emailContent,
    });
  }
}
```

## Coding Standards

### TypeScript Standards

#### Type Definitions

```typescript
// Use interfaces for objects
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Use type for unions/intersections
type UserRole = 'admin' | 'user' | 'guest';

// Use enums for constants
enum ReceiptStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  MATCHED = 'matched',
}
```

#### Naming Conventions

- **Interfaces**: PascalCase, prefixed with 'I' for implementation interfaces
- **Types**: PascalCase
- **Enums**: PascalCase
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: prefixed with underscore

### React Standards

#### Component Structure

```typescript
// Functional components with TypeScript
interface Props {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Click me</button>
    </div>
  );
};
```

#### Hook Rules

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use custom hooks for reusable logic
4. Prefix custom hooks with 'use'

### NestJS Standards

#### Module Structure

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Receipt.name, schema: ReceiptSchema }]),
    OcrModule,
    StorageModule,
  ],
  controllers: [ReceiptController],
  providers: [
    ReceiptService,
    ReceiptRepository,
    {
      provide: RECEIPT_PROCESSOR,
      useClass: ReceiptProcessor,
    },
  ],
  exports: [ReceiptService],
})
export class ReceiptModule {}
```

#### Dependency Injection

1. Constructor injection over property injection
2. Use interfaces for dependencies
3. Use custom providers for complex scenarios
4. Use token-based injection for flexibility

## Testing Standards

### Unit Tests

```typescript
describe('ReceiptService', () => {
  let service: ReceiptService;
  let repository: MockType<ReceiptRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReceiptService,
        {
          provide: ReceiptRepository,
          useFactory: jest.fn(() => ({
            findById: jest.fn(),
            create: jest.fn(),
          })),
        },
      ],
    }).compile();

    service = module.get(ReceiptService);
    repository = module.get(ReceiptRepository);
  });

  it('should find receipt by id', async () => {
    const mockReceipt = { id: '1', status: 'pending' };
    repository.findById.mockResolvedValue(mockReceipt);

    const result = await service.findById('1');
    expect(result).toEqual(mockReceipt);
  });
});
```

### Integration Tests

```typescript
describe('Receipt API', () => {
  let app: INestApplication;
  let repository: ReceiptRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ReceiptModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should create receipt', () => {
    return request(app.getHttpServer())
      .post('/receipts')
      .send(mockReceiptData)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
      });
  });
});
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Processes a receipt using OCR and matches it with expenses
 * @param receipt - The receipt to process
 * @returns Promise<ProcessedReceipt> - The processed receipt with matches
 * @throws {ReceiptProcessingError} When OCR fails
 */
async processReceipt(receipt: Receipt): Promise<ProcessedReceipt> {
  try {
    const ocrResult = await this.ocrService.process(receipt.image);
    const matches = await this.findMatches(ocrResult);
    return { ...receipt, ocrResult, matches };
  } catch (error) {
    throw new ReceiptProcessingError(receipt.id, error);
  }
}
```

### API Documentation

```typescript
@ApiTags('receipts')
@Controller('receipts')
export class ReceiptController {
  @Post()
  @ApiOperation({ summary: 'Create new receipt' })
  @ApiResponse({ status: 201, type: ReceiptDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  async createReceipt(@Body() createReceiptDto: CreateReceiptDto): Promise<ReceiptDto> {
    return this.receiptService.create(createReceiptDto);
  }
}
```

## Git Standards

### Commit Messages

```text
type(scope): description

[optional body]

[optional footer]
```

Types:

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

### Branch Naming

- feature/feature-name
- bugfix/bug-description
- hotfix/emergency-fix
- release/version-number

## Security Standards

### Authentication

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### Authorization

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles.includes(role));
  }
}
```

## Implementation Guidelines

1. Memory Management

   - Efficient data structures
   - Optimized algorithms
   - Resource monitoring
   - Cleanup strategies

2. Error Handling

   - Graceful degradation
   - Retry mechanisms
   - Circuit breaking
   - Error recovery

3. Performance

   - Caching strategies
   - Batch processing
   - Async operations
   - Resource pooling
