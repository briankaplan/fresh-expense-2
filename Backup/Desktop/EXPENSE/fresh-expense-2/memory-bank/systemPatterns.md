# System Patterns

## Architecture Overview

1. Memory Management

   - In-memory storage with persistence
   - Event-driven updates
   - Automatic cleanup strategies
   - Tag-based organization

1. Processing Pipeline

   - Event-driven architecture
   - Modular processing stages
   - Parallel processing capabilities
   - Error recovery mechanisms

1. Service Integration

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

1. **Render Props**

```typescript
// Example: Data fetching
<DataFetcher
  url="/api/data"
  render={data => (
    <DataDisplay data={data} />
  )}
/>
```

1. **Custom Hooks**

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

1. **Query Management**

```typescript
// Example: React Query
const { data, isLoading } = useQuery({
  queryKey: ['receipts'],
  queryFn: fetchReceipts,
  staleTime: 5 * 60 * 1000,
});
```

### Backend Patterns

#### Service Layer

1. **Repository Pattern**

```typescript
@Injectable()
export class ReceiptRepository {
  constructor(
    @InjectModel(Receipt.name)
    private receiptModel: Model<Receipt>,
  ) {}

  async findById(id: string): Promise<Receipt> {
    return this.receiptModel.findById(id).exec();
  }
}
```

1. **Unit of Work**

```typescript
@Injectable()
export class ReceiptService {
  constructor(
    private readonly repository: ReceiptRepository,
    private readonly unitOfWork: UnitOfWork,
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

1. **Custom Exceptions**

```typescript
export class ReceiptNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Receipt with ID ${id} not found`);
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
  async createReceipt(
    @Body() createReceiptDto: CreateReceiptDto,
  ): Promise<ReceiptDto> {
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
