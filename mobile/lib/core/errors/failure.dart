abstract class Failure implements Exception {
  const Failure(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class NetworkFailure extends Failure {
  const NetworkFailure([String message = 'Network unavailable.']) : super(message);
}

class AuthFailure extends Failure {
  const AuthFailure([String message = 'Authentication failed.'])
      : super(message, statusCode: 401);
}

class ServerFailure extends Failure {
  const ServerFailure(String message, {super.statusCode}) : super(message);
}
