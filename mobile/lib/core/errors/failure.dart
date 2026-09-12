abstract class Failure {
  final String message;
  final int? statusCode;

  const Failure(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.statusCode});
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Network connectivity issue. Please check your connection.']);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Authentication failed. Please sign in again.']);
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Failed to load cached local data.']);
}
